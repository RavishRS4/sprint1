import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT ?? 587),
    secure: String(process.env.EMAIL_SECURE).toLowerCase() === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

export const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  const requiredConfig = [process.env.EMAIL_HOST, process.env.EMAIL_PORT, process.env.EMAIL_USER, process.env.EMAIL_PASS];
  const from = process.env.EMAIL_FROM ?? process.env.EMAIL_USER;

  if (requiredConfig.some((value) => !value) || !from) {
    console.warn("Email configuration incomplete. Skipping password reset email send.");
    return false;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from,
    to,
    subject: "Reset your Expense Tracker password",
    html: `
      <p>Hello,</p>
      <p>You requested to reset your password. Click the link below to choose a new password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 30 minutes. If you did not request this change, you can safely ignore this email.</p>
    `
  });

  return true;
};
