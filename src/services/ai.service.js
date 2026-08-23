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
            customer_id: customerId,
            message,
            customer_profile: customerProfile || {},
            products
        }
    );

    return response.data;
};


const bankChatWithAI = async (
    message,
    customerProfile = {},
    products = []
) => {

    const response = await axios.post(
        `${AI_SERVICE_URL}/api/ai/bank-chat`,
        {
            message,
            customer_profile: customerProfile,
            products
        }
    );

    return response.data;
};


module.exports = {
    getAIStatus,
    chatWithAI,
    bankChatWithAI
};