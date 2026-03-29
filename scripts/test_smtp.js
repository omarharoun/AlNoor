const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

(async () => {
  try {
    const cfgPath = path.resolve(__dirname, '..', 'config', 'config.json');
    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    const smtp = cfg.integrations.email.smtp;
    if (!smtp) {
      console.error('No SMTP config found at integrations.email.smtp');
      process.exit(2);
    }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: !!smtp.secure,
      auth: {
        user: smtp.username || smtp.username === undefined ? smtp.username : smtp.username,
        pass: smtp.password,
      },
      tls: { rejectUnauthorized: false },
    });

    const from = smtp.username;
    const to = smtp.username; // send to the authenticated user for a safe test

    console.log('Sending test mail using', smtp.host, 'from', from, 'to', to);

    const info = await transporter.sendMail({
      from: from,
      to: to,
      subject: 'Fluxer SMTP test',
      text: 'This is a test email sent by a local Fluxer test script.',
      envelope: { from: from, to: to },
    });

    console.log('Send result:', info);
    process.exit(0);
  } catch (err) {
    console.error('Error sending test mail:', err && (err.stack || err));
    process.exit(1);
  }
})();
