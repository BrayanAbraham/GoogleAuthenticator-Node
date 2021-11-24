const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const { getQRCode, vertify } = require('./authenticator');

dotenv.config({ path: './config/config.env' });

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (
    !(username === process.env.USERNAME && password === process.env.PASSWORD)
  ) {
    return res.status(401).json({ success: false, error: 'Wrong Credentials' });
  }

  const image = await getQRCode('VWO', username);

  res.status(200).json({
    success: true,
    data: image
  });
});

app.use('/api/mfaVerify', async (req, res) => {
  const { username, otp } = req.body;

  if (await vertify(username, otp)) {
    return res.status(200).json({
      success: true,
      data: 'Success'
    });
  }

  res.status(401).json({ success: false, error: 'Wrong OTP' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle Unhandled Rejetions
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error:${err.message}`);
  server.close(() => process.exit(1));
});
