const mailTemplates = [
    {
        Template: {
            TemplateName: "Verification-mail",
            SubjectPart: "Thanks for registering with us",
            HtmlPart: ` <div class="container" style="text-align: center;">
                            <h3>Thank you {{name}} for registering with us, for complete the process this is your Otp: {{otp}}</h3>
                            </div>`,
        },
    },
];

export default mailTemplates;
