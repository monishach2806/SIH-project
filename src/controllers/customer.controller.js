const customerService = require("../services/customer.service");

const getAllCustomers = async (req, res) => {
    try {
        const customers = await customerService.getAllCustomers();

        res.status(200).json({
            success: true,
            count: customers.length,
            data: customers
        });
    } catch (error) {
        console.error("Get customers error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch customers"
        });
    }
};

const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await customerService.getCustomerById(id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        res.status(200).json({
            success: true,
            data: customer
        });
    } catch (error) {
        console.error("Get customer error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch customer"
        });
    }
};

const getCustomerProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const profile = await customerService.getCustomerProfile(id);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        res.status(200).json({
            success: true,
            data: profile
        });

    } catch (error) {
        console.error("Customer profile error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch customer profile"
        });
    }
};

module.exports = {
    getAllCustomers,
    getCustomerById,
    getCustomerProfile
};