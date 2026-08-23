const aiService = require("../services/ai.service");
const customerService = require("../services/customer.service");
const productService = require("../services/product.service"); 

const getAIStatus = async (req, res) => {
    try {

        const result = await aiService.getAIStatus();

                let cleanResponse = result.response || "";

        cleanResponse = cleanResponse
            .replace(/^#{1,6}\s*/gm, "")
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/\*(.*?)\*/g, "$1")
            .replace(/`(.*?)`/g, "$1")
            .replace(/^[-*]\s+/gm, "• ")
            .replace(/^---+$/gm, "")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

        res.status(200).json({
            ...result,
            response: cleanResponse
        });

    } catch (error) {

        console.error("AI service error:", error.message);

        res.status(503).json({
            success: false,
            message: "AI service unavailable"
        });
    }
};


const chatWithAI = async (req, res) => {

    try {

        const { customerId, message } = req.body;

        if (!customerId || !message) {

            return res.status(400).json({
                success: false,
                message: "customerId and message are required"
            });

        }

        // Get Customer 360
        const customerProfile =
            await customerService.getCustomerProfile(customerId);

        if (!customerProfile) {

            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });

        }

        // Get available products
        const products =
            await productService.getAllProducts();

        console.log(
            "Products sent to AI:",
            JSON.stringify(products, null, 2)
        );
        
        // Send everything to AI service
        const result = await aiService.chatWithAI(
            customerId,
            message,
            customerProfile,
            products
        );

        res.status(200).json(result);

    } catch (error) {

        console.error("AI chat error FULL:", error);

        res.status(503).json({
            success: false,
            message: "AI service unavailable"
        });
    }
};
const bankChatWithAI = async (req, res) => {

    try {

        const {
            message,
            customerProfile,
            products
        } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "message is required"
            });
        }

        const result = await aiService.bankChatWithAI(
            message,
            customerProfile || {},
            products || []
        );

        res.status(200).json(result);

    } catch (error) {

        console.error("Bank AI chat error FULL:", error);

        res.status(503).json({
            success: false,
            message: "Bank AI service unavailable"
        });
    }
};
module.exports = {
    getAIStatus,
    chatWithAI,
    bankChatWithAI
};