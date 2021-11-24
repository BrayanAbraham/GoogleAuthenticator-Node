const fs = require('fs');
const crypto = require('crypto');
const base32 = require('hi-base32');
const qrcode = require('qrcode');

exports.getQRCode = async (issuer, username) => {
  let secret;
  try {
    const data = fs.readFileSync(`./data/${username}_secret.json`).toString();
    secret = JSON.parse(data)[username].secret;
  } catch (error) {}

  if (!secret) {
    secret = generateSecret();
    fs.writeFile(
      `./data/${username}_secret.json`,
      `{"${username}":{"secret":"${secret}"}}`,
      err => {
        if (err) console.log(err);
      }
    );
  }

  url = `otpauth://totp/${issuer}:${username}?secret=${secret}&issuer=${issuer}`;

  const image = await qrcode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    margin: 2
  });

  return image;
};

exports.vertify = (username, otp) => {
  try {
    const data = fs.readFileSync(`./data/${username}_secret.json`).toString();
    secret = JSON.parse(data)[username].secret;
  } catch (error) {}

  if (!secret) {
    return false;
  }

  return verifyTOTP(parseInt(otp), secret);
};

const generateSecret = (length = 20) => {
  const randomBuffer = crypto.randomBytes(length);
  return base32.encode(randomBuffer).replace(/=/g, '');
};

const verifyTOTP = (token, secret, window = 1) => {
  if (Math.abs(window) > 10) {
    return false;
  }

  for (let errorWindow = -window; errorWindow <= +window; errorWindow++) {
    const totp = generateTOTP(secret, errorWindow);
    if (totp === token) {
      return true;
    }
  }
  return false;
};

const generateTOTP = (secret, window = 0) => {
  const counter = Math.floor(Date.now() / 30000);
  return generateHOTP(secret, counter + window);
};

const generateHOTP = (secret, counter) => {
  const decodedSecret = base32.decode.asBytes(secret);

  const buffer = Buffer.alloc(8);
  for (let index = 0; index < 8; index++) {
    buffer[7 - index] = counter & 0xff;
    counter = counter >> 8;
  }

  const hmac = crypto.createHmac('sha1', Buffer.from(decodedSecret));
  hmac.update(buffer);
  const hmacResult = hmac.digest();

  const offset = hmacResult[hmacResult.length - 1] & 0xf;
  const code =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff);

  return code % 10 ** 6;
};
