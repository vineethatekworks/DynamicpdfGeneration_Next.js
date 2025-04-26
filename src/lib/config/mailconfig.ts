import { Buffer } from 'node:buffer';
import nodemailer from 'nodemailer';
import process from 'node:process';

// Create the transporter ONCE
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: "vineethmargana1617@gmail.com",
    pass: "zorw kyti vbcb mnmu",
  },
});

// Create mail options separately
function createMailOptions(to: string, buffer: Buffer) {
  return {
    from: process.env.EMAIL_ID,
    to,
    subject: 'Nomination PDF',
    text: 'Please find the nomination certificate attached.',
    attachments: [
      {
        filename: 'nomination.pdf',
        content: buffer,
      },
    ],
  };
}

// Final sendMailWithPDF function
export async function sendMailWithPDF(buffer: Buffer, to: string) {
  try {
    const mailOptions = createMailOptions(to, buffer);
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully.");
    return true;
  } catch (error) {
    const err = error as Error;
    console.error("Email sending error:", err.message);
    throw new Error(`Something went wrong while sending the email. Details: ${err.message}`);
  }
}
