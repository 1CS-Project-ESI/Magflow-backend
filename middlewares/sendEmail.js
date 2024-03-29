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
              <p><a href="http://localhost:3000/resetPW2?resettoken=${resettoken}">Reset Password</a></p>
              <p>This link is valid for a single use only. If you did not request a password reset, please ignore this email.</p>
              <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
              <p>Thank you,<br>
              The MagFlow Team</p>
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

const sendAccountCreationEmail = async (email, firstname, lastname, password) => {
  const mailOptions = {
    from: 'lh.bouchelarem@esi-sba.dz',
    to: email,
    subject: 'Account Creation Successful on MagFlow',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Account Creation Successful</title>
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
          <h2>Account Creation Successful on MagFlow</h2>
          <p>Dear ${firstname} ${lastname},</p>
          <p>Your account has been created successfully on MagFlow. Here are your credentials:</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p>Please keep your password safe and secure.</p>
          <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
          <p>Thank you,<br>
          The MagFlow Team</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Creation email sent.');
  } catch (error) {
    console.error('Error sending creation email:', error);
  }
};

const sendAccountActivationEmail = async (email) => {
  const mailOptions = {
    from: 'lh.bouchelarem@esi-sba.dz',
    to: email,
    subject: 'Account Activated on MagFlow',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Account Activated on MagFlow</title>
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
          <h2>Account Activated on MagFlow</h2>
          <p>Dear user,</p>
          <p>Your account has been activated on MagFlow. You can now login.</p>
          <p>Please click the following link to login:</p>
          <p><a href="http://localhost:4000/api/auth/login">Log in</a></p>
          <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
          <p>Thank you,<br>
          The MagFlow Team</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Activation email sent.');
  } catch (error) {
    console.error('Error sending activation email:', error);
  }
};


export {sendEmail, sendAccountCreationEmail,sendAccountActivationEmail};