const axios = require("axios");

async function fetchRevenueReports() {
  const response = await axios.get("https://api.paystack.co/revenue/reports", {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  });
  return response.data;
}

async function fetchChargebacks() {}

async function fetchFailedPayments() {}

module.exports = { fetchRevenueReports, fetchChargebacks, fetchFailedPayments };
