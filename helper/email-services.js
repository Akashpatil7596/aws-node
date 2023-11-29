import AWS from "aws-sdk";

import awsConfig from "../config/awsConn.js";
awsConfig();

const ses = new AWS.SES();

const uploadMailTOAWS = async (template) => {
    try {
        const isExist = await ses.getTemplate({
            TemplateName: template.Template.TemplateName,
        });

        if (isExist) {
            return await ses.updateTemplate(template).promise();
        }

        return await ses.createTemplate(template).promise();
    } catch (error) {
        console.log("error", error);
    }
};

export default uploadMailTOAWS;
