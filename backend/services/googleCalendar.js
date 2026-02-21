const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

// Initialize Google Calendar API client
const getCalendarClient = () => {
  try {
    // Try to load from JSON file first (more reliable for Node.js v24+)
    const credentialsPath = path.join(
      __dirname,
      "..",
      "google-credentials.json",
    );

    if (fs.existsSync(credentialsPath)) {
      const auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: ["https://www.googleapis.com/auth/calendar"],
      });
      return google.calendar({ version: "v3", auth });
    }

    // Fallback to environment variables
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.warn(
        "[Google Calendar] Warning: No credentials found. Calendar features will be disabled.",
      );
      return null;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: (process.env.GOOGLE_PRIVATE_KEY || "")
          .replace(/^\\"/, "")
          .replace(/\\"$/, "")
          .replace(/\\",$/, "")
          .replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    return google.calendar({ version: "v3", auth });
  } catch (error) {
    console.error(
      "[Google Calendar] Failed to initialize Google Auth:",
      error.message,
    );
    return null;
  }
};

/**
 * Check availability for a specific date and time
 * @param {Date} date - The date to check
 * @param {string} startTime - Start time in HH:mm format
 * @param {string} endTime - End time in HH:mm format
 * @param {string} timezone - Timezone (default: Asia/Kolkata)
 * @returns {Promise<boolean>} Whether the slot is available
 */
const checkAvailability = async (
  date,
  startTime,
  endTime,
  timezone = "Asia/Kolkata",
) => {
  try {
    const calendar = getCalendarClient();
    if (!calendar) return true; // Assume available if calendar not configured

    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    // Parse date and times
    const dateStr = date.toISOString().split("T")[0];
    const timeMin = new Date(`${dateStr}T${startTime}:00`);
    const timeMax = new Date(`${dateStr}T${endTime}:00`);

    // Check for existing events in the time range
    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    // If no events found, the slot is available
    return response.data.items.length === 0;
  } catch (error) {
    console.error("[Google Calendar] Error checking availability:", error);
    throw new Error("Failed to check calendar availability");
  }
};

/**
 * Get available time slots for a specific date
 * @param {Date} date - The date to check
 * @param {string} timezone - Timezone (default: Asia/Kolkata)
 * @returns {Promise<Array>} Array of available time slots
 */
const getAvailableSlots = async (date, timezone = "Asia/Kolkata") => {
  try {
    const calendar = getCalendarClient();
    if (!calendar) {
      // Return default slots if calendar not configured
      const defaultSlots = [];
      for (let hour = 9; hour < 18; hour++) {
        defaultSlots.push({
          startTime: `${String(hour).padStart(2, "0")}:00`,
          endTime: `${String(hour + 1).padStart(2, "0")}:00`,
          available: true,
        });
      }
      return defaultSlots;
    }
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    // Define business hours (9 AM to 6 PM)
    const businessStart = 9;
    const businessEnd = 18;
    const slotDuration = 1; // 1 hour slots

    const dateStr = date.toISOString().split("T")[0];
    const timeMin = new Date(`${dateStr}T0${businessStart}:00:00`);
    const timeMax = new Date(`${dateStr}T${businessEnd}:00:00`);

    // Get all events for the day
    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const busySlots = response.data.items.map((event) => ({
      start: new Date(event.start.dateTime || event.start.date),
      end: new Date(event.end.dateTime || event.end.date),
    }));

    // Generate all possible slots and filter out busy ones
    const availableSlots = [];
    for (let hour = businessStart; hour < businessEnd; hour++) {
      const slotStart = `${String(hour).padStart(2, "0")}:00`;
      const slotEnd = `${String(hour + slotDuration).padStart(2, "0")}:00`;
      const slotStartDate = new Date(`${dateStr}T${slotStart}:00`);
      const slotEndDate = new Date(`${dateStr}T${slotEnd}:00`);

      // Check if this slot overlaps with any busy slot
      const isBusy = busySlots.some(
        (busy) => slotStartDate < busy.end && slotEndDate > busy.start,
      );

      if (!isBusy) {
        availableSlots.push({
          startTime: slotStart,
          endTime: slotEnd,
          available: true,
        });
      }
    }

    return availableSlots;
  } catch (error) {
    console.error("[Google Calendar] Error getting available slots:", error);
    // Return default slots if calendar API fails
    const defaultSlots = [];
    for (let hour = 9; hour < 18; hour++) {
      defaultSlots.push({
        startTime: `${String(hour).padStart(2, "0")}:00`,
        endTime: `${String(hour + 1).padStart(2, "0")}:00`,
        available: true,
      });
    }
    return defaultSlots;
  }
};

/**
 * Create a calendar event with Google Meet
 * @param {object} appointmentDetails - Appointment details
 * @returns {Promise<object>} Created event with Meet link
 */
const createCalendarEvent = async (appointmentDetails) => {
  try {
    const calendar = getCalendarClient();
    if (!calendar) {
      return {
        eventId: "mock-event-id",
        meetLink: "https://meet.google.com/mock-link",
      };
    }
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    const {
      customerName,
      customerEmail,
      date,
      startTime,
      endTime,
      duration,
      notes,
      timezone = "Asia/Kolkata",
    } = appointmentDetails;

    const dateStr =
      date instanceof Date
        ? date.toISOString().split("T")[0]
        : new Date(date).toISOString().split("T")[0];

    const event = {
      summary: `Appointment with ${customerName}`,
      description: notes || `Appointment booking for ${duration} hour(s)`,
      start: {
        dateTime: `${dateStr}T${startTime}:00`,
        timeZone: timezone,
      },
      end: {
        dateTime: `${dateStr}T${endTime}:00`,
        timeZone: timezone,
      },
      attendees: [{ email: customerEmail, displayName: customerName }],
      conferenceData: {
        createRequest: {
          requestId: `appointment-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 },
          { method: "popup", minutes: 30 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId,
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: "all",
    });

    const createdEvent = response.data;
    const meetLink = createdEvent.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === "video",
    )?.uri;

    return {
      eventId: createdEvent.id,
      meetLink: meetLink || null,
      htmlLink: createdEvent.htmlLink,
    };
  } catch (error) {
    console.error("[Google Calendar] Error creating event:", error);
    throw new Error("Failed to create calendar event");
  }
};

/**
 * Update an existing calendar event
 * @param {string} eventId - Google Calendar event ID
 * @param {object} appointmentDetails - Updated appointment details
 * @returns {Promise<object>} Updated event
 */
const updateCalendarEvent = async (eventId, appointmentDetails) => {
  try {
    const calendar = getCalendarClient();
    if (!calendar)
      return { eventId, meetLink: "https://meet.google.com/mock-link" };

    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    const {
      customerName,
      customerEmail,
      date,
      startTime,
      endTime,
      duration,
      notes,
      timezone = "Asia/Kolkata",
    } = appointmentDetails;

    const dateStr =
      date instanceof Date
        ? date.toISOString().split("T")[0]
        : new Date(date).toISOString().split("T")[0];

    const event = {
      summary: `Rescheduled: Appointment with ${customerName}`,
      description: notes || `Appointment booking for ${duration} hour(s)`,
      start: {
        dateTime: `${dateStr}T${startTime}:00`,
        timeZone: timezone,
      },
      end: {
        dateTime: `${dateStr}T${endTime}:00`,
        timeZone: timezone,
      },
      attendees: [{ email: customerEmail, displayName: customerName }],
    };

    const response = await calendar.events.patch({
      calendarId,
      eventId,
      resource: event,
      sendUpdates: "all",
    });

    return response.data;
  } catch (error) {
    console.error("[Google Calendar] Error updating event:", error);
    throw new Error("Failed to update calendar event");
  }
};

/**
 * Delete a calendar event
 * @param {string} eventId - Google Calendar event ID
 * @returns {Promise<void>}
 */
const deleteCalendarEvent = async (eventId) => {
  try {
    const calendar = getCalendarClient();
    if (!calendar) return;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    await calendar.events.delete({
      calendarId,
      eventId,
      sendUpdates: "all",
    });
  } catch (error) {
    console.error("[Google Calendar] Error deleting event:", error);
    throw new Error("Failed to delete calendar event");
  }
};

module.exports = {
  checkAvailability,
  getAvailableSlots,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
};
