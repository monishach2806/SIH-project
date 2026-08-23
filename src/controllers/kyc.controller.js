const kycService = require("../services/kyc.service");

const createKYC = async (req, res) => {
    try {
        const kyc = await kycService.createKYC(req.body);

        res.status(201).json({
            success: true,
            message: "KYC submitted successfully",
            data: kyc
        });
    } catch (error) {
        console.error("Create KYC error:", error);

        res.status(400).json({
            success: false,
            message: "Failed to submit KYC",
            error: error.message
        });
    }
};

const getKYCByCustomerId = async (req, res) => {
    try {
        const { customerId } = req.params;

        const kyc = await kycService.getKYCByCustomerId(customerId);

        if (!kyc) {
            return res.status(404).json({
                success: false,
                message: "KYC record not found"
            });
        }

        res.status(200).json({
            success: true,
            data: kyc
        });
    } catch (error) {
        console.error("Get KYC error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch KYC",
            error: error.message
        });
    }
};

const getAllKYC = async (req, res) => {
    try {
        const kycRecords = await kycService.getAllKYC();

        res.status(200).json({
            success: true,
            count: kycRecords.length,
            data: kycRecords
        });
    } catch (error) {
        console.error("Get all KYC error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch KYC records",
            error: error.message
        });
    }
};

const updateKYCStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be approved or rejected"
            });
        }

        if (status === "rejected" && !rejectionReason) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required"
            });
        }

        const kyc = await kycService.updateKYCStatus(
            id,
            status,
            rejectionReason || null
        );

        if (!kyc) {
            return res.status(404).json({
                success: false,
                message: "KYC record not found"
            });
        }

        res.status(200).json({
            success: true,
            message: `KYC ${status} successfully`,
            data: kyc
        });
    } catch (error) {
        console.error("Update KYC status error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update KYC status",
            error: error.message
        });
    }
};

module.exports = {
    createKYC,
    getKYCByCustomerId,
    getAllKYC,
    updateKYCStatus
};