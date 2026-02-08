const nodemailer = require("nodemailer");
const ics = require("ics");

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Generate ICS calendar file content
 * @param {object} appointment - Appointment details
 * @returns {Promise<string>} ICS file content
 */
const generateICSFile = (appointment) => {
  return new Promise((resolve, reject) => {
    const {
      customerName,
      customerEmail,
      date,
      startTime,
      endTime,
      duration,
      notes,
      googleMeetLink,
    } = appointment;

    const appointmentDate = new Date(date);
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const event = {
      start: [
        appointmentDate.getFullYear(),
        appointmentDate.getMonth() + 1,
        appointmentDate.getDate(),
        startHour,
        startMin,
      ],
      end: [
        appointmentDate.getFullYear(),
        appointmentDate.getMonth() + 1,
        appointmentDate.getDate(),
        endHour,
        endMin,
      ],
      title: `Appointment with MN Khan`,
      description: `${notes || "Appointment"}\n\n${googleMeetLink ? `Join Google Meet: ${googleMeetLink}` : ""}`,
      location: googleMeetLink || "Online",
      url: googleMeetLink,
      status: "CONFIRMED",
      organizer: { name: "MN Khan", email: process.env.SMTP_USER },
      attendees: [
        {
          name: customerName,
          email: customerEmail,
          rsvp: true,
          partstat: "ACCEPTED",
          role: "REQ-PARTICIPANT",
        },
      ],
      alarms: [
        { action: "display", trigger: { hours: 1, before: true } },
        { action: "display", trigger: { minutes: 30, before: true } },
      ],
    };

    ics.createEvent(event, (error, value) => {
      if (error) {
        console.error("[Email] Error generating ICS:", error);
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
};

/**
 * Send appointment confirmation email
 * @param {object} appointment - Appointment details
 * @returns {Promise<object>} Email send result
 */
const sendConfirmationEmail = async (appointment) => {
  try {
    const transporter = createTransporter();
    const {
      customerName,
      customerEmail,
      date,
      startTime,
      endTime,
      duration,
      totalAmount,
      currency,
      googleMeetLink,
      notes,
    } = appointment;

    // Generate ICS file
    let icsContent = null;
    try {
      icsContent = await generateICSFile(appointment);
    } catch (err) {
      console.warn("[Email] Could not generate ICS file:", err.message);
    }

    // Format date for display
    const appointmentDate = new Date(date);
    const formattedDate = appointmentDate.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Format amount
    const formattedAmount = (totalAmount / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: currency || "INR",
    });

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Confirmed</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Appointment Confirmed! ✓</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-top: 0;">Hello <strong>${customerName}</strong>,</p>
        
        <p>Your appointment has been successfully booked and payment confirmed. Here are your appointment details:</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>📅 Date:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>🕐 Time:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${startTime} - ${endTime}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>⏱️ Duration:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${duration} hour(s)</td>
            </tr>
            <tr>
              <td style="padding: 10px 0;"><strong>💰 Amount Paid:</strong></td>
              <td style="padding: 10px 0; text-align: right; color: #28a745; font-weight: bold;">${formattedAmount}</td>
            </tr>
          </table>
        </div>
        
        ${
          googleMeetLink
            ? `
        <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 15px 0; font-weight: bold; color: #2e7d32;">🎥 Join via Google Meet</p>
          <a href="${googleMeetLink}" style="display: inline-block; background: #1a73e8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Meeting</a>
          <p style="margin: 15px 0 0 0; font-size: 12px; color: #666;">Or copy this link: ${googleMeetLink}</p>
        </div>
        `
            : ""
        }
        
        ${
          notes
            ? `
        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>📝 Notes:</strong></p>
          <p style="margin: 10px 0 0 0; color: #666;">${notes}</p>
        </div>
        `
            : ""
        }
        
        <p style="color: #666; font-size: 14px;">A calendar invite is attached to this email. You can add it to your calendar to receive reminders.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #666; font-size: 12px; text-align: center; margin-bottom: 0;">
          If you have any questions, please reply to this email.<br>
          Thank you for choosing MN Khan.
        </p>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: customerEmail,
      subject: `Appointment Confirmed - ${formattedDate} at ${startTime}`,
      html: emailHtml,
      attachments: icsContent
        ? [
            {
              filename: "appointment.ics",
              content: icsContent,
              contentType: "text/calendar",
            },
          ]
        : [],
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("[Email] Confirmation email sent:", result.messageId);
    return result;
  } catch (error) {
    console.error("[Email] Error sending confirmation email:", error);
    throw new Error("Failed to send confirmation email");
  }
};

/**
 * Send cancellation email
 * @param {object} appointment - Appointment details
 * @param {string} reason - Cancellation reason
 * @returns {Promise<object>} Email send result
 */
const sendCancellationEmail = async (appointment, reason = "") => {
  try {
    const transporter = createTransporter();
    const { customerName, customerEmail, date, startTime } = appointment;

    const appointmentDate = new Date(date);
    const formattedDate = appointmentDate.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Appointment Cancelled</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #dc3545; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Appointment Cancelled</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Hello <strong>${customerName}</strong>,</p>
        
        <p>Your appointment scheduled for <strong>${formattedDate}</strong> at <strong>${startTime}</strong> has been cancelled.</p>
        
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
        
        <p>If you did not request this cancellation or have any questions, please contact us immediately.</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
          Thank you for your understanding.<br>
          MN Khan
        </p>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: customerEmail,
      subject: `Appointment Cancelled - ${formattedDate}`,
      html: emailHtml,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("[Email] Cancellation email sent:", result.messageId);
    return result;
  } catch (error) {
    console.error("[Email] Error sending cancellation email:", error);
    throw new Error("Failed to send cancellation email");
  }
};

/**
 * Send appointment rescheduling email
 * @param {object} appointment - Appointment details
 * @param {object} previousDetails - Previous date and time
 * @returns {Promise<object>} Email send result
 */
const sendRescheduleEmail = async (appointment, previousDetails) => {
  try {
    const transporter = createTransporter();
    const {
      customerName,
      customerEmail,
      date,
      startTime,
      endTime,
      googleMeetLink,
    } = appointment;

    // Generate NEW ICS file
    let icsContent = null;
    try {
      icsContent = await generateICSFile(appointment);
    } catch (err) {
      console.warn(
        "[Email] Could not generate ICS file for reschedule:",
        err.message,
      );
    }

    const appointmentDate = new Date(date);
    const formattedDate = appointmentDate.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const prevDate = new Date(previousDetails.date).toLocaleDateString(
      "en-IN",
      {
        month: "short",
        day: "numeric",
      },
    );

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Rescheduled</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #ff4612; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Appointment Rescheduled 📅</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-top: 0;">Hello <strong>${customerName}</strong>,</p>
        
        <p>Your appointment has been <strong>rescheduled</strong>. Please take note of the new time:</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #ff4612;">
          <p style="color: #666; font-size: 13px; margin: 0 0 10px 0;">WAS: ${prevDate} at ${previousDetails.startTime}</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>📅 New Date:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0;"><strong>🕐 New Time:</strong></td>
              <td style="padding: 10px 0; text-align: right;">${startTime} - ${endTime}</td>
            </tr>
          </table>
        </div>
        
        ${
          googleMeetLink
            ? `
        <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 15px 0; font-weight: bold; color: #2e7d32;">🎥 Google Meet link remains the same</p>
          <a href="${googleMeetLink}" style="display: inline-block; background: #1a73e8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Meeting</a>
        </div>
        `
            : ""
        }
        
        <p style="color: #666; font-size: 14px;">An updated calendar invite is attached to this email.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #666; font-size: 12px; text-align: center; margin-bottom: 0;">
          If this new time doesn't work for you, please let us know immediately.<br>
          Thank you, <br><strong>MN Khan & Associates</strong>
        </p>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: customerEmail,
      subject: `Rescheduled: Appointment on ${formattedDate}`,
      html: emailHtml,
      attachments: icsContent
        ? [
            {
              filename: "appointment_rescheduled.ics",
              content: icsContent,
              contentType: "text/calendar",
            },
          ]
        : [],
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("[Email] Reschedule email sent:", result.messageId);
    return result;
  } catch (error) {
    console.error("[Email] Error sending reschedule email:", error);
    throw new Error("Failed to send reschedule email");
  }
};

/**
 * Send account activation email
 * @param {object} user - User details
 * @returns {Promise<object>} Email send result
 */
const sendAccountActivationEmail = async (user) => {
  try {
    const transporter = createTransporter();
    const { name, email } = user;

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Account Activated</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #28a745; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Account Activated! 🚀</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Hello <strong>${name}</strong>,</p>
        
        <p>Great news! Your account at <strong>MN Khan & Associates</strong> has been reviewed and activated by our team.</p>
        
        <p>You can now log in to the Secure Client Access portal to view service details and manage your legal requirements.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}" style="display: inline-block; background: #333132; color: white; padding: 12px 35px; text-decoration: none; border-radius: 5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Log In to Portal</a>
        </div>
        
        <p>If you have any questions, feel free to reply to this email.</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
          Welcome to the ecosystem.<br>
          MN Khan
        </p>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Welcome to MN Khan - Your account is now active",
      html: emailHtml,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("[Email] Activation email sent:", result.messageId);
    return result;
  } catch (error) {
    console.error("[Email] Error sending activation email:", error);
    throw new Error("Failed to send activation email");
  }
};

/**
 * Send account deactivation email
 * @param {object} user - User details
 * @returns {Promise<object>} Email send result
 */
const sendAccountDeactivationEmail = async (user) => {
  try {
    const transporter = createTransporter();
    const { name, email } = user;

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Account Update</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #6c757d; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Account Update</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Hello <strong>${name}</strong>,</p>
        
        <p>Your account at <strong>MN Khan & Associates</strong> has been deactivated.</p>
        
        <p>If you believe this is a mistake or would like to request reactivation, please contact our administrative team.</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
          Thank you,<br>
          MN Khan
        </p>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Important update regarding your MN Khan account",
      html: emailHtml,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("[Email] Deactivation email sent:", result.messageId);
    return result;
  } catch (error) {
    console.error("[Email] Error sending deactivation email:", error);
    throw new Error("Failed to send deactivation email");
  }
};

module.exports = {
  sendConfirmationEmail,
  sendCancellationEmail,
  sendRescheduleEmail,
  sendAccountActivationEmail,
  sendAccountDeactivationEmail,
  generateICSFile,
};
