const express = require("express");
const cors = require("cors");
const paystackRoutes = require("./routes/paystackRoutes");
require("dotenv").config();

const app = express();

app.use(cors());

app.use(express.raw({ type: "application/json" }));

// Define your routes
app.use("/paystack-webhook", paystackRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
