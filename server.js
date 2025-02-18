const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const port = 3000;

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

let totalRevenue = 0;
let failedPayments = 0;
let chargebacks = 0;

app.use(bodyParser.raw({ type: "application/json" }));

app.post("/paystack-webhook", (req, res) => {
  const payload = req.body;
  const signature = req.headers["x-paystack-signature"];

  console.log("Received payload:", payload.toString());
  console.log("Received signature:", signature);

  const expectedSignature = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex");

  console.log("Expected signature:", expectedSignature);

  // To verify the signature
  if (signature !== expectedSignature) {
    console.error("Invalid signature");
    return res.status(400).send("Invalid signature");
  }

  const event = req.body.event;

  switch (event) {
    case "charge.success":
      console.log("Charge success event received");

      const amount = req.body.data.amount;

      totalRevenue += amount;

      console.log(
        `Transaction successful. Revenue updated: ₦${totalRevenue / 100}`
      );
      break;

    case "charge.failed":
      console.log("Charge failed event received");

      const failedAmount = req.body.data.amount;
      failedPayments += failedAmount;

      console.log(`Failed payment of amount: ₦${failedAmount / 100}`);
      break;

    case "chargeback.created":
      console.log("Chargeback created event received");

      const chargebackAmount = req.body.data.amount;
      totalRevenue -= chargebackAmount;
      chargebacks += chargebackAmount;

      console.log(
        `Chargeback of amount: ₦${
          chargebackAmount / 100
        } processed. Updated revenue: ₦${totalRevenue / 100}`
      );

      break;

    default:
      console.log("Unknown event received");
      break;
  }

  res.status(200).send("OK");
});

app.get("/revenue-report", (req, res) => {
  res.status(200).json({
    totalRevenue: totalRevenue / 100,
    failedPayments: failedPayments / 100,
    chargebacks: chargebacks / 100,
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
