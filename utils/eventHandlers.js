const { revenueData } = require("../data/revenueData");

// Event handler for charge.success event
function handleChargeSuccess(req) {
  console.log("Charge success event received");

  const amount = req.body.data.amount;
  revenueData.totalRevenue += amount;

  console.log(
    `Transaction successful. Revenue updated: ₦${
      revenueData.totalRevenue / 100
    }`
  );
}

// Event handler for charge.failed event
function handleChargeFailed(req) {
  console.log("Charge failed event received");

  const failedAmount = req.body.data.amount;
  revenueData.failedPayments += failedAmount;

  console.log(`Failed payment of amount: ₦${failedAmount / 100}`);
}

// Event handler for chargeback.created event
function handleChargebackCreated(req) {
  console.log("Chargeback created event received");

  const chargebackAmount = req.body.data.amount;
  revenueData.totalRevenue -= chargebackAmount;
  revenueData.chargebacks += chargebackAmount;

  console.log(
    `Chargeback of amount: ₦${
      chargebackAmount / 100
    } processed. Updated revenue: ₦${revenueData.totalRevenue / 100}`
  );
}

module.exports = {
  handleChargeSuccess,
  handleChargeFailed,
  handleChargebackCreated,
};
