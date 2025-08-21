require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: process.env.NODE_ENV == "developement" ? false : true,
  auth: {
    user: process.env.HOST_MAIL,
    pass: process.env.HOST_APP_PASSWORD,
  },
});

// sendMail to registred user
exports.emailSend = async (email, subject, template) => {
  const info = await transporter.sendMail({
    from: "Node 2501",
    to: Array.isArray(email) ? `${email.join(",")}` : email,
    subject: subject,
    html: template,
  });
  console.log("Message sent:", info.messageId);
  return info.messageId;
};

// make otp
exports.Otp = () => {
  return crypto.randomInt(1000, 9999);
};
