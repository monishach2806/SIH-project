const axios = require("axios");

const AI_SERVICE_URL =
    process.env.AI_SERVICE_URL || "http://localhost:8000";


const getAIStatus = async () => {
    const response = await axios.get(
        `${AI_SERVICE_URL}/api/ai/status`
    );

    return response.data;
};


const chatWithAI = async (
    customerId,
    message,
    customerProfile = null,
    products = []
) => {

    const response = await axios.post(
        `${AI_SERVICE_URL}/api/ai/chat`,
        {
            customerId,
            message,
            customerProfile,
            products
        }
    );

    return response.data;
};


module.exports = {
    getAIStatus,
    chatWithAI
};