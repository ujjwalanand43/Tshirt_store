const nodemailer = require('nodemailer');

const mailHelper = async(option) => {
    var transport = nodemailer.createTransport({
        // host: "smtp.mailtrap.io",
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            // user: "580e2052066f19",
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    var mailOptions = {
        from: process.env.USER_EMAIL,
        to: option.email,
        subject: option.subject,
        text: option.message,
    };

    transport.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log("someError Occured", error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

}

module.exports = mailHelper;