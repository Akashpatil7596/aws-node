import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";

const emailConfig = {
    service: "gmail",
    auth: {
        user: process.env.SENDER_MAIL_NODEMAILER,
        pass: process.env.SENDER_PASSWORD_NODEMAILER,
    },
};

const SOURCE_EMAIL = process.env.SMTP_SOURCE_EMAIL;

const transporter = nodemailer.createTransport(smtpTransport(emailConfig));

const sendNodeMail = async (data) => {
    try {
        const fromEmail = SOURCE_EMAIL;

        transporter.verify((err, success) => {
            if (err) {
                console.error(err);
            } else {
                console.log("Your config is correct");
            }
        });

        let mailOptions = {
            from: fromEmail,

            to: data.to,
            subject: data.subject,
            text: data.text,
            html: data.html,

            ses: {},
            attachments: data.attachments,
        };

        if (data.cc) {
            mailOptions.cc = data.cc; //Email cc recipient [Array or String]
        }
        if (data.bcc) {
            mailOptions.bcc = data.bcc; //Email bcc recipient [Array or String]
        }

        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log("error | nodemailer.js | line:49 : ", error);
    }
};

export default sendNodeMail;
