const axios = require("axios");

async function sendNotificationToTelex(data, returnUrl) {
  try {
    await axios.post(returnUrl, data);
  } catch (error) {
    console.error("Error sending notification to Telex:", error);
  }
}

module.exports = { sendNotificationToTelex };
