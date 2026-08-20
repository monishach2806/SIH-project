const express = require("express");

const router = express.Router();

const customerController = require("../controllers/customer.controller");

router.get("/", customerController.getAllCustomers);

router.get("/:id/profile", customerController.getCustomerProfile);

router.get("/:id", customerController.getCustomerById);

module.exports = router;