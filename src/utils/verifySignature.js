const crypto = require("crypto");

// Function to verify Paystack signature
function verifyPaystackSignature(payload, signature) {
  const expectedSignature = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex");

  console.log("Expected Signature:", expectedSignature);
  console.log("Received Signature:", signature);

  return expectedSignature === signature;
}

module.exports = { verifyPaystackSignature };
