import AWS from "aws-sdk";

import awsConfig from "../config/awsConn.js";
awsConfig();

const ses = new AWS.SES();

const sendMail = async (emailData) => {
    try {
        let params = {
            Source: emailData.from,
            Template: emailData.template,
            Destination: {
                ToAddresses: [emailData.to],
            },
            ReplyToAddresses: [],
            TemplateData: '{"name": "' + emailData.templateData.name + '", "otp": "' + emailData.templateData.otp + '"}',
        };
        await ses.sendTemplatedEmail(params).promise();
    } catch (error) {
        console.log(error);
    }
};

export default sendMail;
