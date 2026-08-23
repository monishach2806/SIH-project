const express = require("express");

const router = express.Router();

const customerController =
    require("../controllers/customer.controller");


/* =========================
   CREATE CUSTOMER
========================= */

router.post(
    "/",
    customerController.createCustomer
);


/* =========================
   CUSTOMER LOGIN
========================= */

router.post(
    "/login",
    customerController.loginCustomer
);


/* =========================
   GET ALL CUSTOMERS
========================= */

router.get(
    "/",
    customerController.getAllCustomers
);


/* =========================
   GET CUSTOMER PROFILE
========================= */

router.get(
    "/:id/profile",
    customerController.getCustomerProfile
);


/* =========================
   GET CUSTOMER INSIGHTS
========================= */

router.get(
    "/:id/insights",
    customerController.getCustomerInsights
);


/* =========================
   GET CUSTOMER BY ID
========================= */

router.get(
    "/:id",
    customerController.getCustomerById
);


module.exports = router;