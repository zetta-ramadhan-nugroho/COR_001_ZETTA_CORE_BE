// *************** IMPORT LIBRARY ***************
const nodemailer = require('nodemailer');

// *************** IMPORT CORE ***************
const config = require('../../core/config');
const { AppError } = require('../../core/error');

// *************** TRANSPORTER INITIALIZATION ***************

// *************** Lazily create transporter only when first used
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

// *************** MAILER SERVICE ***************

/**
 * Sends an email via the configured SMTP transport.
 *
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject line
 * @param {string} params.html - HTML body content
 * @param {string} [params.text] - Plain text fallback body
 * @returns {Promise<void>}
 * @throws {AppError} If sending fails
 */
async function SendEmail({ to, subject, html, text }) {
  if (!to || !subject || !html) {
    throw new AppError(
      'Email recipient, subject, and HTML body are required.',
      'MAILER_INVALID_PARAMS',
      400
    );
  }

  try {
    const mail = getTransporter();
    await mail.sendMail({
      from: config.mailer_from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),
    });
  } catch (error) {
    throw new AppError(
      `Email delivery failed: ${error.message}`,
      'MAILER_SEND_FAILED',
      500
    );
  }
}

// *************** EXPORT MODULE ***************
module.exports = { SendEmail };
