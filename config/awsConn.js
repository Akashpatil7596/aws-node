import AWS from "aws-sdk";

const awsConfig = async (accessKey = process.env.AWS_ACCESS_KEY, secretKey = process.env.AWS_SECRET_KEY, region = process.env.AWS_REGION) => {
    return await AWS.config.update({
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
        region: region,
    });
};

export default awsConfig;
