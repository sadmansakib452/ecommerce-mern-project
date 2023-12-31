require("dotenv").config();

const serverPort = process.env.SERVER_PORT || 3002;

const mongodbURL = process.env.MONGODB_ATLAS_URL 

const defaultImagePath =
  process.env.DEFAULT_USER_IMAGE || "public/images/users/default.png";

const jwtActivationKey = process.env.JWT_ACTIVATION_KEY || 'sdfdssfdsfdfd'
const jwtAccessKey = process.env.JWT_ACCESS_KEY || "sdfdssfdsfdfd";
const jwtRefreshKey = process.env.JWT_REFRESH_KEY || "sdfdssfdsfdfd";
const jwtResetPasswordKey = process.env.JWT_RESET_PASSWORD_KEY || "sdfdssfdsfdfd";

const smtpUsername = process.env.SMTP_USERNAME || ''
const smtpPassword = process.env.SMTP_PASSWORD || ''

const clientURL = process.env.CLIENT_URL || ''
const serverURL = process.env.SERVER_URL || "";




module.exports = {
  serverPort,
  mongodbURL,
  defaultImagePath,
  jwtActivationKey,
  smtpPassword,
  smtpUsername,
  clientURL,
  jwtAccessKey,
  jwtResetPasswordKey,
  jwtRefreshKey,
  serverURL,
};
