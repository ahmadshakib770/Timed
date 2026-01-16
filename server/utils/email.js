import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Generate 6-digit verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email, code) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Timed Planner - Email Verification',
      html: `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; font-family: 'Courier New', monospace;">
          <div style="background: rgba(0,0,0,0.8); border: 2px solid #ff00ff; padding: 30px; max-width: 500px; margin: 0 auto; box-shadow: 0 0 20px rgba(255,0,255,0.5);">
            <h1 style="color: #00ffff; text-shadow: 0 0 10px #00ffff; text-align: center; margin-bottom: 20px;">
              ◢ TIMED PLANNER ◣
            </h1>
            <p style="color: #ff00ff; font-size: 16px; text-align: center; margin-bottom: 30px;">
              Welcome to the retro future of productivity
            </p>
            <div style="background: rgba(255,0,255,0.1); border: 1px solid #ff00ff; padding: 20px; text-align: center; margin: 20px 0;">
              <p style="color: #00ffff; margin: 0 0 10px 0; font-size: 14px;">Your Verification Code:</p>
              <h2 style="color: #fff; font-size: 36px; letter-spacing: 8px; margin: 0; text-shadow: 0 0 10px #ff00ff;">
                ${code}
              </h2>
            </div>
            <p style="color: #00ffff; font-size: 14px; text-align: center; margin-top: 20px;">
              This code will expire in 10 minutes
            </p>
            <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};
