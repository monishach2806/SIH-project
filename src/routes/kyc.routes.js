const express = require("express");

const router = express.Router();

const kycController = require("../controllers/kyc.controller");

router.post("/", kycController.createKYC);

router.get(
    "/customer/:customerId",
    kycController.getKYCByCustomerId
);

router.get("/", kycController.getAllKYC);

router.patch(
    "/:id/status",
    kycController.updateKYCStatus
);

module.exports = router;