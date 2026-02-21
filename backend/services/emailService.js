const nodemailer = require("nodemailer");
const ics = require("ics");

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS, // Expected to be an App Password
    },
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000,
    socketTimeout: 45000,
    debug: true, // Enable debug logs
    logger: true, // Log to console
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
 * @param {Buffer} invoiceBuffer - Optional invoice PDF buffer
 * @returns {Promise<object>} Email send result
 */
const sendConfirmationEmail = async (appointment, invoiceBuffer = null) => {
  console.log("[Email] Debug env ADMIN_NOTIFICATION_EMAIL:", process.env.ADMIN_NOTIFICATION_EMAIL);
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
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1e1e1e; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e0e0e0; overflow: hidden; }
        .header { background-color: #1e1e1e; padding: 40px 20px; text-align: center; border-bottom: 4px solid #df6a1f; }
        .header h1 { color: #ffffff; margin: 0; font-family: 'Playfair Display', serif; font-style: italic; font-size: 28px; letter-spacing: 1px; }
        .header p { color: #df6a1f; margin: 5px 0 0 0; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; }
        .content { padding: 40px; }
        .content h2 { font-family: 'Playfair Display', serif; font-style: italic; color: #1e1e1e; font-size: 22px; margin-top: 0; }
        .details-box { background: #fcfcfc; border: 1px solid #f0f0f0; border-radius: 4px; padding: 25px; margin: 30px 0; }
        .details-table { width: 100%; border-collapse: collapse; }
        .details-table td { padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
        .details-table td:last-child { text-align: right; font-weight: 600; }
        .btn-container { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; background-color: #df6a1f; color: #ffffff !important; padding: 14px 35px; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px; }
        .footer { background: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #eee; }
        .footer p { font-size: 11px; color: #888; margin: 5px 0; }
        .legal { font-size: 10px; color: #aaa; margin-top: 20px; font-style: italic; line-height: 1.4; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MN Khan & Associates</h1>
          <p>Legal Excellence</p>
        </div>
        
        <div class="content">
          <h2>Appointment Confirmed</h2>
          <p>Hello <strong>${customerName}</strong>,</p>
          <p>Your legal consultation has been successfully scheduled. We have reserved the following time for your matter:</p>
          
          <div class="details-box">
            <table class="details-table">
              <tr>
                <td>Scheduled Date</td>
                <td>${formattedDate}</td>
              </tr>
              <tr>
                <td>Time Window</td>
                <td>${startTime} - ${endTime}</td>
              </tr>
              <tr>
                <td>Consultation Duration</td>
                <td>${duration} hour(s)</td>
              </tr>
              <tr>
                <td>Commitment Fee Paid</td>
                <td style="color: #df6a1f;">${formattedAmount}</td>
              </tr>
            </table>
          </div>
          
          ${googleMeetLink ? `
          <div style="background: #fdf8f4; border-left: 4px solid #df6a1f; padding: 20px; margin: 30px 0;">
            <p style="margin: 0 0 15px 0; font-weight: bold; font-size: 13px;">Virtual Chambers Access</p>
            <div class="btn-container" style="text-align: left; margin: 0;">
              <a href="${googleMeetLink}" class="btn">Enter Meeting</a>
            </div>
            <p style="margin: 15px 0 0 0; font-size: 11px; color: #888;">Meeting Link: ${googleMeetLink}</p>
          </div>
          ` : ""}
          
          ${notes ? `
          <div style="margin: 30px 0;">
            <p style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #888; margin-bottom: 10px;">Counsel Notes</p>
            <p style="margin: 0; font-style: italic; color: #555; border-left: 2px solid #eee; padding-left: 15px;">"${notes}"</p>
          </div>
          ` : ""}
          
          <p style="font-size: 13px; color: #666; margin-top: 40px;">A digital calendar file (.ics) and your invoice are attached for your records. We look forward to our session.</p>
        </div>
        
        <div class="footer">
          <p><strong>MN Khan & Associates</strong></p>
          <p>This is an automated communication from the Counsel Registry.</p>
          <div class="legal">
            Disclaimer: This email and any attachments are confidential and intended solely for the use of the individual or entity to whom they are addressed. If you have received this email in error please notify the system manager.
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: customerEmail,
      subject: `Appointment Confirmed - ${formattedDate} at ${startTime}`,
      html: emailHtml,
      attachments: [
        ...(icsContent
          ? [
              {
                filename: "appointment.ics",
                content: icsContent,
                contentType: "text/calendar",
              },
            ]
          : []),
        ...(invoiceBuffer
          ? [
              {
                filename: `Invoice-${appointment._id.toString().slice(-6).toUpperCase()}.pdf`,
                content: invoiceBuffer,
                contentType: "application/pdf",
              },
            ]
          : []),
      ],
    };

    if (process.env.ADMIN_NOTIFICATION_EMAIL) {
      mailOptions.bcc = process.env.ADMIN_NOTIFICATION_EMAIL;
    }

    console.log(`[Email] Sending confirmation to: ${mailOptions.to}, BCC: ${mailOptions.bcc || 'None'}`);

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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Cancelled</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1e1e1e; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e0e0e0; overflow: hidden; }
        .header { background-color: #1e1e1e; padding: 40px 20px; text-align: center; border-bottom: 4px solid #dc3545; }
        .header h1 { color: #ffffff; margin: 0; font-family: 'Playfair Display', serif; font-style: italic; font-size: 28px; letter-spacing: 1px; }
        .header p { color: #dc3545; margin: 5px 0 0 0; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; }
        .content { padding: 40px; }
        .content h2 { font-family: 'Playfair Display', serif; font-style: italic; color: #1e1e1e; font-size: 22px; margin-top: 0; }
        .details-box { background: #fffcfc; border: 1px solid #ffebeb; border-radius: 4px; padding: 25px; margin: 30px 0; }
        .footer { background: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #eee; }
        .footer p { font-size: 11px; color: #888; margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MN Khan & Associates</h1>
          <p>Legal Excellence</p>
        </div>
        
        <div class="content">
          <h2>Appointment Cancelled</h2>
          <p>Hello <strong>${customerName}</strong>,</p>
          <p>This is to inform you that your appointment scheduled for <strong>${formattedDate}</strong> at <strong>${startTime}</strong> has been cancelled.</p>
          
          <div class="details-box">
             ${reason ? `<p style="margin: 0; font-size: 14px; color: #555;"><strong>Reason for Cancellation:</strong><br><span style="font-style: italic; color: #dc3545;">"${reason}"</span></p>` : "<p style=\"margin: 0; font-size: 14px; color: #555;\">The appointment has been removed from the registry.</p>"}
          </div>
          
          <p style="font-size: 13px; color: #666; margin-top: 40px;">If this was unexpected or you wish to schedule a new consultation, please visit the portal.</p>
        </div>
        
        <div class="footer">
          <p><strong>MN Khan & Associates</strong></p>
          <p>Registry Update | Procedural Notice</p>
        </div>
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

    if (process.env.ADMIN_NOTIFICATION_EMAIL) {
      mailOptions.bcc = process.env.ADMIN_NOTIFICATION_EMAIL;
    }

    console.log(`[Email] Sending cancellation to: ${mailOptions.to}, BCC: ${mailOptions.bcc || 'None'}`);

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
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1e1e1e; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e0e0e0; overflow: hidden; }
        .header { background-color: #1e1e1e; padding: 40px 20px; text-align: center; border-bottom: 4px solid #df6a1f; }
        .header h1 { color: #ffffff; margin: 0; font-family: 'Playfair Display', serif; font-style: italic; font-size: 28px; letter-spacing: 1px; }
        .header p { color: #df6a1f; margin: 5px 0 0 0; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; }
        .content { padding: 40px; }
        .content h2 { font-family: 'Playfair Display', serif; font-style: italic; color: #1e1e1e; font-size: 22px; margin-top: 0; }
        .details-box { background: #fcfcfc; border: 1px solid #f0f0f0; border-radius: 4px; padding: 25px; margin: 30px 0; position: relative; }
        .prev-label { display: block; font-size: 10px; text-transform: uppercase; color: #888; margin-bottom: 10px; text-decoration: line-through; }
        .details-table { width: 100%; border-collapse: collapse; }
        .details-table td { padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
        .details-table td:last-child { text-align: right; font-weight: 600; }
        .btn-container { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; background-color: #df6a1f; color: #ffffff !important; padding: 14px 35px; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px; }
        .footer { background: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #eee; }
        .footer p { font-size: 11px; color: #888; margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MN Khan & Associates</h1>
          <p>Legal Excellence</p>
        </div>
        
        <div class="content">
          <h2>Registry Update: Rescheduled</h2>
          <p>Hello <strong>${customerName}</strong>,</p>
          <p>Your appointment has been updated to a new time. Please take note of the rescheduled details below:</p>
          
          <div class="details-box">
            <span class="prev-label">Was: ${prevDate} at ${previousDetails.startTime}</span>
            <table class="details-table">
              <tr>
                <td>New Date</td>
                <td>${formattedDate}</td>
              </tr>
              <tr>
                <td>New Time</td>
                <td>${startTime} - ${endTime}</td>
              </tr>
            </table>
          </div>
          
          ${googleMeetLink ? `
          <div style="background: #fdf8f4; border-left: 4px solid #df6a1f; padding: 20px; margin: 30px 0;">
            <p style="margin: 0 0 15px 0; font-weight: bold; font-size: 13px;">Virtual Chambers Access</p>
            <div class="btn-container" style="text-align: left; margin: 0;">
              <a href="${googleMeetLink}" class="btn">Enter Meeting</a>
            </div>
          </div>
          ` : ""}
          
          <p style="font-size: 13px; color: #666; margin-top: 40px;">An updated calendar invite has been attached to this notice.</p>
        </div>
        
        <div class="footer">
          <p><strong>MN Khan & Associates</strong></p>
          <p>Registry Update | Procedural Notice</p>
        </div>
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

    if (process.env.ADMIN_NOTIFICATION_EMAIL) {
      mailOptions.bcc = process.env.ADMIN_NOTIFICATION_EMAIL;
    }

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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Activated</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1e1e1e; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e0e0e0; overflow: hidden; }
        .header { background-color: #1e1e1e; padding: 40px 20px; text-align: center; border-bottom: 4px solid #df6a1f; }
        .header h1 { color: #ffffff; margin: 0; font-family: 'Playfair Display', serif; font-style: italic; font-size: 28px; letter-spacing: 1px; }
        .header p { color: #df6a1f; margin: 5px 0 0 0; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; }
        .content { padding: 40px; }
        .content h2 { font-family: 'Playfair Display', serif; font-style: italic; color: #1e1e1e; font-size: 22px; margin-top: 0; }
        .btn-container { text-align: center; margin: 40px 0; }
        .btn { display: inline-block; background-color: #1e1e1e; color: #ffffff !important; padding: 14px 40px; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px; border: 1px solid #df6a1f; }
        .footer { background: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #eee; }
        .footer p { font-size: 11px; color: #888; margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MN Khan & Associates</h1>
          <p>Legal Excellence</p>
        </div>
        
        <div class="content">
          <h2>Registry Activation</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>We are pleased to inform you that your professional account with <strong>MN Khan & Associates</strong> has been activated following administrative review.</p>
          <p>You now have full access to the Secure Client Portal to manage your legal matters, upload documents, and track procedural progress in real-time.</p>
          
          <div class="btn-container">
            <a href="${process.env.FRONTEND_URL || "http://nodes.mnkhan.com"}" class="btn">Access Portal</a>
          </div>
          
          <p style="font-size: 13px; color: #666;">If you require technical assistance or have questions regarding your account, please reply to this notice.</p>
        </div>
        
        <div class="footer">
          <p><strong>MN Khan & Associates</strong></p>
          <p>Official Authentication Notice</p>
        </div>
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

    if (process.env.ADMIN_NOTIFICATION_EMAIL) {
      mailOptions.bcc = process.env.ADMIN_NOTIFICATION_EMAIL;
    }

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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Update</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1e1e1e; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e0e0e0; overflow: hidden; }
        .header { background-color: #1e1e1e; padding: 40px 20px; text-align: center; border-bottom: 4px solid #6c757d; }
        .header h1 { color: #ffffff; margin: 0; font-family: 'Playfair Display', serif; font-style: italic; font-size: 28px; letter-spacing: 1px; }
        .header p { color: #6c757d; margin: 5px 0 0 0; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; }
        .content { padding: 40px; }
        .content h2 { font-family: 'Playfair Display', serif; font-style: italic; color: #1e1e1e; font-size: 22px; margin-top: 0; }
        .info-box { background: #f8f9fa; border: 1px solid #eee; border-radius: 4px; padding: 25px; margin: 30px 0; }
        .footer { background: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #eee; }
        .footer p { font-size: 11px; color: #888; margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MN Khan & Associates</h1>
          <p>Legal Excellence</p>
        </div>
        
        <div class="content">
          <h2>Registry Update: Account Status</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>This is a formal notification that your professional account at <strong>MN Khan & Associates</strong> has been deactivated.</p>
          
          <div class="info-box">
            <p style="margin: 0; font-size: 14px; color: #555;">Access to the Secure Client Portal and associated legal matters has been restricted. Data associated with your account remains secured within our registry.</p>
          </div>
          
          <p style="font-size: 13px; color: #666;">If you believe this is a procedural error or wish to request reinstatement, please contact our administrative team.</p>
        </div>
        
        <div class="footer">
          <p><strong>MN Khan & Associates</strong></p>
          <p>Registry Update | Procedural Notice</p>
        </div>
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

    if (process.env.ADMIN_NOTIFICATION_EMAIL) {
      mailOptions.bcc = process.env.ADMIN_NOTIFICATION_EMAIL;
    }

    const result = await transporter.sendMail(mailOptions);
    console.log("[Email] Deactivation email sent:", result.messageId);
    return result;
  } catch (error) {
    console.error("[Email] Error sending deactivation email:", error);
    throw new Error("Failed to send deactivation email");
  }
};

/**
 * Send service purchase confirmation email
 * @param {object} user - User details
 * @param {Array} services - List of services purchased
 * @param {number} totalAmount - Total amount paid (in paise)
 * @param {string} orderId - Razorpay Order ID
 * @param {Buffer} invoiceBuffer - Optional invoice PDF buffer
 * @returns {Promise<object>} Email send result
 */
const sendServiceConfirmationEmail = async (user, services, totalAmount, orderId, invoiceBuffer = null) => {
  try {
    const transporter = createTransporter();
    const { name, email } = user;

    const formattedAmount = (totalAmount / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    });

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Service Purchase Confirmed</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1e1e1e; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e0e0e0; overflow: hidden; }
        .header { background-color: #1e1e1e; padding: 40px 20px; text-align: center; border-bottom: 4px solid #df6a1f; }
        .header h1 { color: #ffffff; margin: 0; font-family: 'Playfair Display', serif; font-style: italic; font-size: 28px; letter-spacing: 1px; }
        .header p { color: #df6a1f; margin: 5px 0 0 0; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; }
        .content { padding: 40px; }
        .content h2 { font-family: 'Playfair Display', serif; font-style: italic; color: #1e1e1e; font-size: 22px; margin-top: 0; }
        .service-list { margin: 30px 0; border: 1px solid #f0f0f0; border-radius: 2px; }
        .service-item { padding: 15px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
        .service-item:last-child { border-bottom: none; }
        .service-name { font-size: 14px; font-weight: 600; color: #1e1e1e; }
        .service-status { font-size: 9px; font-weight: 800; background: #fdf8f4; color: #df6a1f; padding: 4px 8px; border: 1px solid #fae7d9; border-radius: 2px; text-transform: uppercase; letter-spacing: 1px; }
        .total-box { padding: 15px; background: #fafafa; text-align: right; border-top: 1px solid #f0f0f0; }
        .total-box span { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-right: 15px; }
        .total-amount { font-size: 18px; font-weight: 700; color: #1e1e1e; font-family: 'Playfair Display', serif; }
        .ref-box { background: #fcfcfc; border: 1px dashed #e0e0e0; padding: 15px; margin-bottom: 30px; }
        .btn-container { text-align: center; margin: 40px 0; }
        .btn { display: inline-block; background-color: #df6a1f; color: #ffffff !important; padding: 14px 40px; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px; }
        .footer { background: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #eee; }
        .footer p { font-size: 11px; color: #888; margin: 5px 0; }
        .legal { font-size: 10px; color: #aaa; margin-top: 20px; font-style: italic; line-height: 1.4; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MN Khan & Associates</h1>
          <p>Legal Excellence</p>
        </div>
        
        <div class="content">
          <h2>Service Purchase Confirmation</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your requisition for legal services has been confirmed. Our counsel team has been assigned to your matters and will initiate the procedural flow immediately.</p>
          
          <div class="service-list">
            ${services.map(s => `
              <table style="width: 100%; border-bottom: 1px solid #f0f0f0;">
                <tr>
                  <td style="padding: 15px; font-size: 14px; font-weight: 600; color: #1e1e1e;">${s.name}</td>
                  <td style="padding: 15px; text-align: right;">
                    <span style="font-size: 9px; font-weight: 800; background: #fdf8f4; color: #df6a1f; padding: 4px 8px; border: 1px solid #fae7d9; border-radius: 2px; text-transform: uppercase; letter-spacing: 1px;">Queued</span>
                  </td>
                </tr>
              </table>
            `).join('')}
            <div class="total-box">
              <span>Total Commitment</span>
              <span class="total-amount">${formattedAmount}</span>
            </div>
          </div>

          <div class="ref-box">
            <p style="margin: 0; font-size: 9px; text-transform: uppercase; color: #888; letter-spacing: 1px;">Nexus Order Reference</p>
            <p style="margin: 5px 0 0 0; font-family: monospace; font-size: 13px; font-weight: bold; color: #1e1e1e;">${orderId}</p>
          </div>
          
          <p style="font-size: 13px; color: #444;">Please access your Secure Client Portal to upload any prerequisite documents and track the lifecycle of your matters.</p>
          
          <div class="btn-container">
            <a href="${process.env.FRONTEND_URL || "http://nodes.mnkhan.com"}/portal" class="btn">View My Matters</a>
          </div>
          
          <p style="font-size: 11px; color: #888; text-align: center;">Your official invoice has been attached to this communication.</p>
        </div>
        
        <div class="footer">
          <p><strong>MN Khan & Associates</strong></p>
          <p>Automated Transaction Registry</p>
          <div class="legal">
            Legal Disclaimer: This email is an automated confirmation of service purchase. Fulfillment is subject to document verification and procedural compliance.
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Service Confirmation - Order ${orderId.slice(-8).toUpperCase()}`,
      html: emailHtml,
      attachments: invoiceBuffer
        ? [
            {
              filename: `Invoice-${orderId.slice(-8).toUpperCase()}.pdf`,
              content: invoiceBuffer,
              contentType: "application/pdf",
            },
          ]
        : [],
    };

    if (process.env.ADMIN_NOTIFICATION_EMAIL) {
      mailOptions.bcc = process.env.ADMIN_NOTIFICATION_EMAIL;
    }

    const result = await transporter.sendMail(mailOptions);
    console.log("[Email] Service confirmation sent:", result.messageId);
    return result;
  } catch (error) {
    console.error("[Email] Error sending service confirmation:", error);
    // Don't throw, we don't want to break the payment flow if email fails
    return null;
  }
};

/**
 * Send task update email
 * @param {object} user - User details
 * @param {object} task - Task details
 * @param {string} eventName - Name of the event
 * @param {string} note - Optional note
 * @returns {Promise<object>} Email send result
 */
const sendTaskUpdateEmail = async (user, task, eventName, note = "") => {
  try {
    const transporter = createTransporter();
    const { name, email } = user;

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Matter Update</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1e1e1e; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e0e0e0; overflow: hidden; }
        .header { background-color: #1e1e1e; padding: 40px 20px; text-align: center; border-bottom: 4px solid #df6a1f; }
        .header h1 { color: #ffffff; margin: 0; font-family: 'Playfair Display', serif; font-style: italic; font-size: 28px; letter-spacing: 1px; }
        .header p { color: #df6a1f; margin: 5px 0 0 0; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; }
        .content { padding: 40px; }
        .content h2 { font-family: 'Playfair Display', serif; font-style: italic; color: #1e1e1e; font-size: 22px; margin-top: 0; }
        .update-box { background: #fcfcfc; border: 1px solid #f0f0f0; border-radius: 4px; padding: 25px; margin: 30px 0; border-left: 4px solid #df6a1f; }
        .status-badge { display: inline-block; font-size: 10px; font-weight: bold; color: #ffffff; background: #1e1e1e; padding: 5px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }
        .btn-container { text-align: center; margin: 40px 0; }
        .btn { display: inline-block; background-color: #df6a1f; color: #ffffff !important; padding: 14px 40px; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px; }
        .footer { background: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #eee; }
        .footer p { font-size: 11px; color: #888; margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MN Khan & Associates</h1>
          <p>Legal Excellence</p>
        </div>
        
        <div class="content">
          <h2>Matter Progress Update</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>This is an automated notification regarding a new development in your active matter: <strong style="font-family: 'Playfair Display', serif; font-style: italic;">${task.title}</strong>.</p>
          
          <div class="update-box">
             <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1e1e1e;">${eventName}</p>
             ${note ? `<p style="margin: 15px 0 0 0; color: #666; font-style: italic; border-top: 1px solid #f0f0f0; pt-15">"${note}"</p>` : ""}
          </div>
          
          <div style="margin: 30px 0; font-size: 13px;">
            <p><strong>Current Registry Status:</strong> <span class="status-badge">${task.status}</span></p>
            <p><strong>Procedural Progress:</strong> ${task.progress}%</p>
          </div>
          
          <div class="btn-container">
            <a href="${process.env.FRONTEND_URL || "http://nodes.mnkhan.com"}/portal" class="btn">Examine Update</a>
          </div>
          
          <p style="font-size: 12px; color: #888; text-align: center;">You can examine the full case history and timeline in your client portal.</p>
        </div>
        
        <div class="footer">
          <p><strong>MN Khan & Associates</strong></p>
          <p>Case Management Registry Update</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Update on your matter: ${task.title}`,
      html: emailHtml,
    };

    if (process.env.ADMIN_NOTIFICATION_EMAIL) {
      mailOptions.bcc = process.env.ADMIN_NOTIFICATION_EMAIL;
    }

    const result = await transporter.sendMail(mailOptions);
    console.log("[Email] Task update email sent:", result.messageId);
    return result;
  } catch (error) {
    console.error("[Email] Error sending task update email:", error);
    return null;
  }
};

module.exports = {
  sendConfirmationEmail,
  sendCancellationEmail,
  sendRescheduleEmail,
  sendAccountActivationEmail,
  sendAccountDeactivationEmail,
  sendServiceConfirmationEmail,
  sendTaskUpdateEmail,
  generateICSFile,
};
