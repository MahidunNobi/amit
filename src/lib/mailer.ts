import nodemailer from 'nodemailer';

const service = process.env.EMAIL_SERVICE;
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;
const from = process.env.EMAIL_FROM;


export async function sendPasswordResetEmail(email: string, token: string) {
    if (!service || !user || !pass || !from) {
        console.warn("Email server environment variables are not set. Skipping email.")
        console.log(`Password reset link (for testing): /reset-password?token=${token}`);
        return;
    }
    
    const transporter = nodemailer.createTransport({
        service: service,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    const mailOptions = {
        from: from,
        to: email,
        subject: 'Password Reset Request',
        html: `<p>You requested a password reset. Click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a><p>This link will expire in 1 hour.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent to:', email);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Could not send password reset email.');
    }
} 