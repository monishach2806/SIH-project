const express = require("express");

const router = express.Router();

const aiController = require("../controllers/ai.controller");


router.get(
    "/status",
    aiController.getAIStatus
);


router.post(
    "/chat",
    aiController.chatWithAI
);
router.post(
    "/bank-chat",
    aiController.bankChatWithAI
);

module.exports = router;