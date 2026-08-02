const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const { SMTP, CLIENT_URL } = require('../config/env');

const tp = nodemailer.createTransport({ host: SMTP.host, port: SMTP.port, auth: { user: SMTP.user, pass: SMTP.pass } });

exports.sendEmail = async (opts) => {
  try {
    await tp.sendMail({ from: SMTP.user, ...opts });
    logger.info('Email sent to ' + opts.to);
  } catch (e) { logger.error('Email error', e); }
};

exports.sendVerificationEmail = (to, n, t) => this.sendEmail({ to, subject: 'Verify Email', html: `<a href="${CLIENT_URL}/verify-email/${t}">Verify</a>` });
exports.sendPasswordResetEmail = (to, n, t) => this.sendEmail({ to, subject: 'Reset Password', html: `<a href="${CLIENT_URL}/reset-password/${t}">Reset</a>` });
exports.sendWelcomeEmail = (to, n) => this.sendEmail({ to, subject: 'Welcome', html: 'Welcome to NotaryChain!' });
exports.sendNotificationEmail = (to, n, notif) => this.sendEmail({ to, subject: notif.title, html: notif.message });
