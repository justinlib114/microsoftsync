const nodemailer = require('nodemailer');
const config = require('../config/config');

async function sendLicenseNotification(email, productName) {
  let transporter = nodemailer.createTransport({
    service: 'Gmail', // You can use other services like SendGrid, Mailgun, etc.
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  let info = await transporter.sendMail({
    from: '"Library" <your_email@example.com>', // Replace with your email
    to: email,
    subject: `Access to ${productName} Granted`,
    text: `You have been granted access to ${productName}. You can now download and install the product.`,
  });

  console.log('Message sent: %s', info.messageId);
}

module.exports = { sendLicenseNotification };
