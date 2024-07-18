const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

//https://ethereal.email/create
let nodeConfig = {
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.EMAIL, // generated ethereal user
    pass: process.env.PASSWORD, // generated ethereal password
  },
};

let transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Mailgen",
    link: "https://mailgen.js",
  },
});

/** POST: http://localhost:5000/api/registerMail
 * @param: {
  "username" : "example123",
  "userEmail" : "admin123",
  "text" : "",
  "subject" : ""
}
*/
module.exports.registerMail = function (req, res) {
  const { username, userEmail, text, subject } = req.body;

  //body of the email
  var email = {
    body: {
      name: username,
      intro:
        text ||
        "welcome to Nodemailer Daily Tuition! we're very excited to have you on board",
      outro:
        "Need help, or have question...? Just reply to the email, we'd love to help.",
    },
  };

  var emailBody = MailGenerator.generate(email);

  let message = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: subject || "Signup Successful",
    html: emailBody,
  };

  // send mail
  transporter
    .sendMail(message)
    .then(() => {
      return res
        .status(200)
        .send({ msg: "You should receive an email from us....!" });
    })
    .catch((error) => res.status(500).send({ error }));
};
