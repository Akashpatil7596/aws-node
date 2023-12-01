import { responses } from "./responses/responses.js";

class CommonResponses {
    async Success(res, status, data, messageCode) {
        try {
            const response = responses[messageCode];

            return res.status(status).json({
                success: true,
                data: data,
                message: response,
            });
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    async Error(res, status, data, messageCode) {
        try {
            const response = responses[messageCode];

            return res.status(status).json({
                success: false,
                data: data,
                message: response,
            });
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    async InternalError(res, status, data, messageCode) {
        try {
            const response = responses[messageCode];

            return res.status(status).json({
                success: false,
                data: data,
                message: response,
            });
        } catch (error) {
            console.log(error);
            return error;
        }
    }
}

export default CommonResponses;
