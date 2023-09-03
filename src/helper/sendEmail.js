const createError = require('http-errors');
const emailWithNodeMail = require('./email');

const sendEmail = async (emailData) =>{

    try {
      await emailWithNodeMail(emailData);
    } catch (emailError) {
      throw createError(500, "Failed to send varification email")
    
    }
}

module.exports = sendEmail