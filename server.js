const express = require("express");
const cors = require("cors");
require("dotenv").config();

const routes = require("./routes/routes");

const app = express();
const port = 3000;

app.use(cors());

app.use(express.raw({ type: "application/json" }));

app.use("/paystack-webhook", routes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
