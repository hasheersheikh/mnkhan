const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const HourlyRate = require("../models/HourlyRate");
const razorpayService = require("../services/razorpay");
const googleCalendarService = require("../services/googleCalendar");
const emailService = require("../services/emailService");

/**
 * POST /api/appointment
 * Create a new appointment and initiate Razorpay payment
 */
router.post("/", async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      date,
      startTime,
      duration,
      notes,
      timezone = "Asia/Kolkata",
    } = req.body;

    // Validate required fields
    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !date ||
      !startTime ||
      !duration
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Get current hourly rate
    const hourlyRate = await HourlyRate.getCurrentRate();
    if (!hourlyRate) {
      return res.status(400).json({
        success: false,
        message: "No active hourly rate configured",
      });
    }

    // Calculate end time
    const [startHour, startMin] = startTime.split(":").map(Number);
    const endHour = startHour + duration;
    const endTime = `${String(endHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;

    // Calculate total amount
    const totalAmount = hourlyRate.rate * duration;

    // Check calendar availability (optional - continues if fails)
    let isAvailable = true;
    try {
      isAvailable = await googleCalendarService.checkAvailability(
        new Date(date),
        startTime,
        endTime,
        timezone,
      );
    } catch (err) {
      console.warn(
        "[Appointment] Could not check calendar availability:",
        err.message,
      );
    }

    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message:
          "This time slot is no longer available. Please select another time.",
      });
    }

    // Check for Razorpay bypass (Dev Mode)
    if (process.env.BYPASS_PAYMENT === "true") {
      console.log(
        "[Appointment] Bypassing Razorpay payment for dev environment",
      );

      const appointment = new Appointment({
        customerName,
        customerEmail,
        customerPhone,
        date: new Date(date),
        startTime,
        endTime,
        duration,
        timezone,
        notes,
        hourlyRate: hourlyRate.rate,
        totalAmount,
        razorpayOrderId: `bypass_${Date.now()}`,
        paymentStatus: "paid",
        status: "confirmed",
        confirmedAt: new Date(),
      });

      // Create Google Calendar event with Meet link
      try {
        const calendarResult = await googleCalendarService.createCalendarEvent({
          customerName: appointment.customerName,
          customerEmail: appointment.customerEmail,
          date: appointment.date,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          duration: appointment.duration,
          notes: appointment.notes,
          timezone: appointment.timezone,
        });

        appointment.googleCalendarEventId = calendarResult.eventId;
        appointment.googleMeetLink = calendarResult.meetLink;
      } catch (err) {
        console.warn(
          "[Appointment] Could not create calendar event in bypass mode:",
          err.message,
        );
      }

      await appointment.save();

      // Send confirmation email
      try {
        await emailService.sendConfirmationEmail({
          customerName: appointment.customerName,
          customerEmail: appointment.customerEmail,
          date: appointment.date,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          duration: appointment.duration,
          totalAmount: appointment.totalAmount,
          currency: appointment.currency,
          googleMeetLink: appointment.googleMeetLink,
          notes: appointment.notes,
        });
      } catch (err) {
        console.warn(
          "[Appointment] Could not send confirmation email in bypass mode:",
          err.message,
        );
      }

      return res.status(201).json({
        success: true,
        message: "Appointment confirmed (Payment Bypassed)",
        paymentBypassed: true,
        appointment: {
          id: appointment._id,
          date: appointment.date,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          duration: appointment.duration,
          status: appointment.status,
          googleMeetLink: appointment.googleMeetLink,
        },
      });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpayService.createOrder(
      totalAmount,
      "INR",
      {
        customerName,
        customerEmail,
        appointmentDate: date,
        startTime,
      },
    );

    // Create appointment record (pending payment)
    const appointment = new Appointment({
      customerName,
      customerEmail,
      customerPhone,
      date: new Date(date),
      startTime,
      endTime,
      duration,
      timezone,
      notes,
      hourlyRate: hourlyRate.rate,
      totalAmount,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "pending",
      status: "pending",
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: "Appointment created. Please complete payment.",
      appointment: {
        id: appointment._id,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        duration: appointment.duration,
        totalAmount: appointment.totalAmount,
        currency: appointment.currency,
      },
      razorpay: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("[Appointment] Error creating appointment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create appointment",
    });
  }
});

/**
 * POST /api/appointment/verify-payment
 * Verify Razorpay payment and confirm appointment
 */
router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      appointmentId,
    } = req.body;

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Verify payment signature
    const isValid = razorpayService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!isValid) {
      appointment.paymentStatus = "failed";
      await appointment.save();
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Update appointment with payment details
    appointment.razorpayPaymentId = razorpay_payment_id;
    appointment.razorpaySignature = razorpay_signature;
    appointment.paymentStatus = "paid";
    appointment.status = "confirmed";
    appointment.confirmedAt = new Date();

    // Create Google Calendar event with Meet link
    try {
      const calendarResult = await googleCalendarService.createCalendarEvent({
        customerName: appointment.customerName,
        customerEmail: appointment.customerEmail,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        duration: appointment.duration,
        notes: appointment.notes,
        timezone: appointment.timezone,
      });

      appointment.googleCalendarEventId = calendarResult.eventId;
      appointment.googleMeetLink = calendarResult.meetLink;
    } catch (err) {
      console.warn(
        "[Appointment] Could not create calendar event:",
        err.message,
      );
    }

    await appointment.save();

    // Send confirmation email
    try {
      await emailService.sendConfirmationEmail({
        customerName: appointment.customerName,
        customerEmail: appointment.customerEmail,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        duration: appointment.duration,
        totalAmount: appointment.totalAmount,
        currency: appointment.currency,
        googleMeetLink: appointment.googleMeetLink,
        notes: appointment.notes,
      });
    } catch (err) {
      console.warn(
        "[Appointment] Could not send confirmation email:",
        err.message,
      );
    }

    res.json({
      success: true,
      message: "Payment verified and appointment confirmed",
      appointment: {
        id: appointment._id,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        duration: appointment.duration,
        status: appointment.status,
        googleMeetLink: appointment.googleMeetLink,
      },
    });
  } catch (error) {
    console.error("[Appointment] Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment",
    });
  }
});

/**
 * POST /api/appointment/webhook
 * Handle Razorpay webhook events
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.headers["x-razorpay-signature"];
      const body = req.body.toString();

      // Verify webhook signature
      const isValid = razorpayService.verifyWebhookSignature(body, signature);
      if (!isValid) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid signature" });
      }

      const event = JSON.parse(body);
      const { event: eventType, payload } = event;

      console.log("[Webhook] Received event:", eventType);

      switch (eventType) {
        case "payment.captured": {
          const payment = payload.payment.entity;
          const orderId = payment.order_id;

          // Find and update appointment
          const appointment = await Appointment.findOne({
            razorpayOrderId: orderId,
          });
          if (appointment && appointment.paymentStatus !== "paid") {
            appointment.razorpayPaymentId = payment.id;
            appointment.paymentStatus = "paid";
            appointment.status = "confirmed";
            appointment.confirmedAt = new Date();
            await appointment.save();
            console.log(
              "[Webhook] Appointment confirmed via webhook:",
              appointment._id,
            );
          }
          break;
        }

        case "payment.failed": {
          const payment = payload.payment.entity;
          const orderId = payment.order_id;

          const appointment = await Appointment.findOne({
            razorpayOrderId: orderId,
          });
          if (appointment) {
            appointment.paymentStatus = "failed";
            await appointment.save();
            console.log(
              "[Webhook] Payment failed for appointment:",
              appointment._id,
            );
          }
          break;
        }

        case "refund.created": {
          const refund = payload.refund.entity;
          const paymentId = refund.payment_id;

          const appointment = await Appointment.findOne({
            razorpayPaymentId: paymentId,
          });
          if (appointment) {
            appointment.paymentStatus = "refunded";
            appointment.status = "cancelled";
            appointment.cancelledAt = new Date();
            await appointment.save();
            console.log(
              "[Webhook] Refund processed for appointment:",
              appointment._id,
            );
          }
          break;
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("[Webhook] Error processing webhook:", error);
      res
        .status(500)
        .json({ success: false, message: "Webhook processing failed" });
    }
  },
);

/**
 * GET /api/availability
 * Get available time slots for a specific date
 */
router.get("/availability", async (req, res) => {
  try {
    const { date, timezone = "Asia/Kolkata" } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    // Get slots from Google Calendar
    let slots = await googleCalendarService.getAvailableSlots(
      new Date(date),
      timezone,
    );

    // Also filter out slots that have pending/confirmed appointments in DB
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      date: { $gte: dateStart, $lte: dateEnd },
      status: { $in: ["pending", "confirmed"] },
    });

    // Filter out booked slots
    slots = slots.filter((slot) => {
      return !bookedAppointments.some((apt) => {
        const aptStart = apt.startTime;
        const aptEnd = apt.endTime;
        return slot.startTime >= aptStart && slot.startTime < aptEnd;
      });
    });

    res.json({
      success: true,
      date,
      slots,
    });
  } catch (error) {
    console.error("[Availability] Error fetching availability:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch availability",
    });
  }
});

/**
 * GET /api/appointment
 * Get all appointments (admin)
 */
router.get("/", async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(query)
      .sort({ date: -1, startTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[Appointment] Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch appointments",
    });
  }
});

/**
 * GET /api/appointment/:id
 * Get a specific appointment
 */
router.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error("[Appointment] Error fetching appointment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch appointment",
    });
  }
});

/**
 * PATCH /api/appointment/:id/cancel
 * Cancel an appointment
 */
router.patch("/:id/cancel", async (req, res) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Appointment is already cancelled",
      });
    }

    appointment.status = "cancelled";
    appointment.cancelledAt = new Date();
    appointment.cancelReason = reason;
    await appointment.save();

    // Delete Google Calendar event if exists
    if (appointment.googleCalendarEventId) {
      try {
        await googleCalendarService.deleteCalendarEvent(
          appointment.googleCalendarEventId,
        );
      } catch (err) {
        console.warn(
          "[Appointment] Could not delete calendar event:",
          err.message,
        );
      }
    }

    // Send cancellation email
    try {
      await emailService.sendCancellationEmail(appointment, reason);
    } catch (err) {
      console.warn(
        "[Appointment] Could not send cancellation email:",
        err.message,
      );
    }

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    console.error("[Appointment] Error cancelling appointment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel appointment",
    });
  }
});

/**
 * PATCH /api/appointment/:id/reschedule
 * Reschedule an appointment
 */
router.patch("/:id/reschedule", async (req, res) => {
  try {
    const { date, startTime, timezone = "Asia/Kolkata" } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (!date || !startTime) {
      return res.status(400).json({
        success: false,
        message: "New date and start time are required",
      });
    }

    // Check availability for the new slot
    const [startHour, startMin] = startTime.split(":").map(Number);
    const endHour = startHour + appointment.duration;
    const endTime = `${String(endHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;

    const isAvailable = await googleCalendarService.checkAvailability(
      new Date(date),
      startTime,
      endTime,
      timezone,
    );

    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: "The requested time slot is not available",
      });
    }

    // Store previous details for email
    const previousDetails = {
      date: appointment.date,
      startTime: appointment.startTime,
    };

    // Update appointment document
    appointment.date = new Date(date);
    appointment.startTime = startTime;
    appointment.endTime = endTime;
    appointment.timezone = timezone;
    appointment.status = "confirmed"; // Ensure it's confirmed if it was pending or something

    // Update Google Calendar event
    if (appointment.googleCalendarEventId) {
      try {
        await googleCalendarService.updateCalendarEvent(
          appointment.googleCalendarEventId,
          {
            customerName: appointment.customerName,
            customerEmail: appointment.customerEmail,
            date: appointment.date,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            duration: appointment.duration,
            notes: appointment.notes,
            timezone: appointment.timezone,
          },
        );
      } catch (err) {
        console.warn(
          "[Appointment] Could not update calendar event:",
          err.message,
        );
      }
    }

    await appointment.save();

    // Send rescheduling email
    try {
      await emailService.sendRescheduleEmail(appointment, previousDetails);
    } catch (err) {
      console.warn(
        "[Appointment] Could not send reschedule email:",
        err.message,
      );
    }

    res.json({
      success: true,
      message: "Appointment rescheduled successfully",
      appointment,
    });
  } catch (error) {
    console.error("[Appointment] Error rescheduling appointment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to reschedule appointment",
    });
  }
});

module.exports = router;
