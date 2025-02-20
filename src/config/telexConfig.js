const getIntegrationJson = (req, res) => {
  const baseUrl = req.protocol + "://" + req.get("host");

  const telexAppData = {
    data: {
      date: {
        created_at: "2025-02-18",
        updated_at: "2025-02-18",
      },
      descriptions: {
        app_name: "telex-paystack-notification",
        app_description:
          "A telex feature that entails getting notifications on revenue reports, chargebacks and failed payments",
        app_logo: "https://paystack-to-telex-app.onrender.com",
        app_url: "https://paystack-to-telex-app.onrender.com",
        background_color: "#fff",
      },
      is_active: true,
      integration_type: "interval",
      key_features: [
        "real time updates on revenue reports. chargebacks and failed payments",
      ],
      integration_category: "Finance & Payments",
      author: "Ademola",
      settings: [
        {
          label: "telex-channel",
          type: "text",
          required: true,
          default: "transaction-alerts",
        },
        {
          label: "time interval",
          type: "dropdown",
          required: true,
          default: "immediate",
          options: [
            "immediate",
            "Every 5-minutes",
            "Every 10-minutes",
            "Every 1-hour",
          ],
        },
        {
          label: "event type",
          type: "dropdown",
          required: true,
          default: "revenue-reports",
          options: ["revenue-reports", "chargebacks", "failed-payments"],
        },
        {
          label: "message",
          type: "text",
          required: true,
          default: "Basic",
        },
        {
          label: "include log",
          type: "checkbox",
          required: true,
          default: "true",
        },
        {
          label: "interval",
          type: "text",
          required: true,
          default: "*/10 * * * *",
        },
      ],
      target_url: "https://paystack-url-webhook.onrender.com/paystack-webhook",
      tick_url: `${baseUrl}/paystack-payments`,
    },
  };

  res.json(telexAppData);
};

module.exports = { getIntegrationJson };
