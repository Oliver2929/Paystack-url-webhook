async function handlePaystackWebhook(req, res) {
  console.log("Request Headers:", req.headers);
  console.log("Request Body:", req.body);
  console.log("Received payload:", req.body);

  const signature = req.headers["x-paystack-signature"];
  const payload = JSON.stringify(req.body);

  if (signature && !verifyPaystackSignature(payload, signature)) {
    console.error("Invalid signature");
    return res.status(400).send("Invalid signature");
  }

  const event = req.body.event;
  if (!event) {
    console.log("No event received in the webhook payload.");
    return res.status(400).send("Event not found in the payload");
  }

  try {
    switch (event) {
      case "charge.success":
        console.log("Charge success event received");
        const successAmount = req.body.data.amount;
        totalRevenue += successAmount;
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
        return res.status(400).send("Unknown event type");
    }

    if (req.query.channel_id && req.query.return_url && req.query.settings) {
      try {
        res.status(202).send({ status: "accepted" });

        const { channel_id, return_url, settings } = req.query;
        let parsedSettings;

        try {
          parsedSettings = JSON.parse(settings);
        } catch (parseError) {
          console.error("Error parsing settings:", parseError);
          return res.status(400).send("Invalid settings format.");
        }

        setTimeout(async () => {
          try {
            const eventType = parsedSettings.find(
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
                console.error("Unknown event type:", eventType);
                return res.status(400).send("Unknown event type");
            }

            const responseData = {
              event_name: eventType,
              status: "success",
              message: `Processed the requested ${eventType} data successfully`,
              username: "PaystackBot",
            };

            if (return_url) {
              try {
                await sendNotificationToTelex(responseData, return_url);
              } catch (error) {
                console.error("Error sending Telex notification:", error);
                return res.status(500).send("Error notifying Telex");
              }
            }
          } catch (error) {
            console.error("Error in setTimeout handling:", error);
            res.status(500).send("Error processing webhook event");
          }
        }, 0);
      } catch (error) {
        console.error("Error processing Telex request:", error);

        const errorData = {
          event_name: "error",
          status: "failed",
          message: "Failed to process the requested event data.",
          username: "PaystackBot",
        };

        if (req.query.return_url) {
          try {
            await sendNotificationToTelex(errorData, req.query.return_url);
          } catch (error) {
            console.error("Error sending error notification to Telex:", error);
          }
        }

        res.status(500).send("Error processing Telex request");
      }
    } else {
      res
        .status(400)
        .send("Invalid request: Missing required query parameters");
    }
  } catch (error) {
    console.error("Error processing Paystack webhook:", error);
    return res.status(500).send("Error processing webhook");
  }
}

module.exports = { handlePaystackWebhook };
