const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
var path = require("path");
const { getName } = require("../users/users.helpers");

const transport = nodemailer.createTransport({
  host: "es001vs0064",
  port: 25,
  secure: false,
  auth: {
    user: process.env.NODE_NODEMAILER_EMAIL,
    pass: process.env.NODE_NODEMAILER_PASSWORD,
  },
});

const options = {
  viewEngine: {
    extName: ".handlebars",
    partialsDir: path.resolve(__dirname, "views"),
    defaultLayout: false,
  },
  viewPath: path.resolve(__dirname, "views"),
  extName: ".handlebars",
};

transport.use("compile", hbs(options));

exports.sendEmail = async (email, subject, template, link) => {
  const mailOptions = {
    from: process.env.NODE_NODEMAILER_EMAIL,
    to: email,
    replyTo: process.env.NODE_NODEMAILER_EMAIL,
    subject,
    template,
    context: {
      name: getName(email),
      link,
    },
    attachments: [
      {
        filename: "technip.png",
        path: __dirname + "/views/assets/technip.png",
        cid: "technip", //same cid value as in the html img src
      },
    ],
  };
  try {
    transport.sendMail(mailOptions, function (err, data) {
      if (err) {
        console.error("err: ", err);
        throw err;
      }
    });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
