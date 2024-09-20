const nodemailer = require('nodemailer');

exports.sendEmail = async (to, subject, htmlContent) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"OTP API" <${process.env.USER_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
    });

  } catch (error) {
    console.log(error);
  }
};
