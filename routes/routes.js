const express = require("express");
const crypto = require("crypto");
const {
  handleChargeSuccess,
  handleChargeFailed,
  handleChargebackCreated,
} = require("../utils/eventHandlers");
const { getIntegrationJson } = require("../config/telexConfig");
const { revenueData } = require("../data/revenueData");

const router = express.Router();

router.get("/integration-json", getIntegrationJson);

router.post("/", (req, res) => {
  const payload = req.body;
  const signature = req.headers["x-paystack-signature"];

  if (!verifySignature(payload, signature)) {
    console.error("Invalid signature");
    return res.status(400).send("Invalid signature");
  }

  const event = req.body.event;

  switch (event) {
    case "charge.success":
      handleChargeSuccess(req);
      break;
    case "charge.failed":
      handleChargeFailed(req);
      break;
    case "chargeback.created":
      handleChargebackCreated(req);
      break;
    default:
      console.log("Unknown event received");
      break;
  }

  res.status(200).send("OK");
});

// Revenue Report Route (GET)
router.get("/revenue-report", (req, res) => {
  res.status(200).json({
    totalRevenue: revenueData.totalRevenue / 100,
    failedPayments: revenueData.failedPayments / 100,
    chargebacks: revenueData.chargebacks / 100,
  });
});

function verifySignature(payload, signature) {
  const expectedSignature = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex");

  console.log("Expected Signature:", expectedSignature);
  console.log("Received Signature:", signature);

  return signature === expectedSignature;
}

module.exports = router;
