require("dotenv").config();
const express = require("express");
const { rateLimit } = require("express-rate-limit");
const app = express();

// SETTINGS
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(require("cors")());

// SECURITY
app.use(require("helmet")());
app.disable("x-powered-by");
app.use(require("hpp")()); // middleware to protect against HTTP Parameter Pollution attacks
// adding limiter to /user requests to stop brute force attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after an hour",
});

// To use the rate limiting middleware to certain API calls only, you can select routes like this:
// - app.use('/user', apiLimiter)
app.use(apiLimiter);

// ROUTES
app.use("/users", require("./src/main/users/user.routes"));
app.use("/feed", require("./src/main/feed/feed.routes"));
app.use("/ifd", require("./src/main/ifd/ifd.routes"));
app.use("/ifc", require("./src/main/ifc/ifc.routes"));
app.use("/lines", require("./src/main/lines/lines.routes"));
app.use("/areas", require("./src/main/areas/areas.routes"));
app.use("/diameters", require("./src/main/diameters/diameters.routes"));

// NODE-CRON
require("./src/main/ifd/ifd.node_cron")();

// 404 HANDLING
app.use("*", (req, res) => {
  var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  console.error(
    `Someone with IP ${ip} tried to go to: ${req.baseUrl} but got sent an error`
  );
  res.send({ ok: false, body: "Please, stop inventing" });
});

// set port, listen for requests
app.listen(process.env.NODE_DB_PORT, () => {
  console.info(`Server is running on port: ${process.env.NODE_DB_PORT}`);
});
