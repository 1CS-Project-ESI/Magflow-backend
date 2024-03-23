import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587 ,
    auth: {
        user: "lh.bouchelarem@esi-sba.dz",
        pass : "xsmtpsib-6725b163f16104bbf45b61e879efa8ee089189fcb64328b03b41a40c758c15e6-gpR9Eq3w5kGB8O7h",
    }
});

const sendEmail = async (email, resettoken) => {
  const mailOptions = {
    from: 'lh.bouchelarem@esi-sba.dz',
    to: email,
    subject: 'Password Reset',
    html: `<!DOCTYPE html>
    <html>
    <head>
        <title>Password Reset Request</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.5;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
                border-radius: 5px;
            }
        </style>
      </head>
      <body>
          <div class="container">
              <h2>Password Reset Request</h2>
              <p>Dear User,</p>
              <p>You recently requested to reset your password. To proceed with the password reset, please click the link below:</p>
              <p><a href="http://localhost:4000/api/auth/reset-password/${resettoken}">Reset Password</a></p>
              <p>This link is valid for a single use only. If you did not request a password reset, please ignore this email.</p>
              <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
              <p>Thank you,<br>
              The Support Team</p>
          </div>
      </body>
      </html>
            `,

  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent.');
    console.log(resettoken);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

export default sendEmail;