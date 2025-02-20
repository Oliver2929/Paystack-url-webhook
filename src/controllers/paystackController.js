const { verifyPaystackSignature } = require("../utils/verifySignature");
const {
  fetchRevenueReports,
  fetchChargebacks,
  fetchFailedPayments,
} = require("../services/paystackService");
const { sendNotificationToTelex } = require("../services/telexService");

async function handlePaystackWebhook(req, res) {
  const signature = req.headers["x-paystack-signature"];
  const payload = JSON.stringify(req.body);

  // Check if it's a Paystack webhook request
  if (signature) {
    // Verify the Paystack signature
    if (!verifyPaystackSignature(payload, signature)) {
      return res
        .status(400)
        .send(
          "Invalid signature. Webhook request may have been tampered with."
        );
    }

    try {
      const event = req.body;
      const eventType = event.event;

      let data;
      switch (eventType) {
        case "chargebacks":
          data = await fetchChargebacks();
          break;
        case "failed-payments":
          data = await fetchFailedPayments();
          break;
        case "revenue-reports":
          data = await fetchRevenueReports();
          break;
        default:
          throw new Error("Unknown event type");
      }

      await sendNotificationToTelex(data, event.return_url);
      res.status(200).send("Webhook processed successfully");
    } catch (error) {
      console.error("Error processing Paystack webhook:", error);
      res.status(500).send("Error processing webhook");
    }
  } else if (req.body.channel_id && req.body.return_url && req.body.settings) {
    try {
      res.status(202).send({ status: "accepted" });

      const { channel_id, return_url, settings } = req.body;

      setTimeout(async () => {
        const eventType = settings.find(
          (setting) => setting.label === "event-type"
        )?.default;

        let data;
        switch (eventType) {
          case "chargebacks":
            data = await fetchChargebacks();
            break;
          case "failed-payments":
            data = await fetchFailedPayments();
            break;
          case "revenue-reports":
            data = await fetchRevenueReports();
            break;
          default:
            throw new Error("Unknown event type");
        }

        const responseData = {
          message: `Processed the requested ${eventType} data successfully`,
          channel_id,
          event_name: eventType,
          status: "success",
          username: "PaystackBot",
          data,
          return_url,
          settings,
        };

        await sendNotificationToTelex(responseData, return_url);
      }, 0);
    } catch (error) {
      console.error("Error processing Telex request:", error);

      const errorData = {
        message: "Failed to process the requested event data.",
        channel_id: req.body.channel_id,
        status: "failed",
        username: "PaystackBot",
        error: error.message,
        return_url: req.body.return_url,
        settings: req.body.settings,
      };

      await sendNotificationToTelex(errorData, req.body.return_url);
    }
  } else {
    res.status(400).send("Invalid request");
  }
}

module.exports = { handlePaystackWebhook };
