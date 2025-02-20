const express = require("express");
const { handlePaystackWebhook } = require("../controllers/paystackController");
const { getIntegrationJson } = require("../config/telexConfig");

const router = express.Router();

router.get("/integration-json", getIntegrationJson);

router.post("/paystack-telex", handlePaystackWebhook);

module.exports = router;
