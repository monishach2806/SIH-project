const customerService =
    require("../services/customer.service");

const bcrypt =
    require("bcrypt");


/* =========================
   GET ALL CUSTOMERS
========================= */

const getAllCustomers = async (req, res) => {

    try {

        const customers =
            await customerService.getAllCustomers();


        res.status(200).json({

            success: true,

            count:
                customers.length,

            data:
                customers

        });

    } catch (error) {

        console.error(
            "Get customers error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch customers"

        });
    }
};


/* =========================
   GET CUSTOMER BY ID
========================= */

const getCustomerById = async (req, res) => {

    try {

        const { id } =
            req.params;


        const customer =
            await customerService.getCustomerById(id);


        if (!customer) {

            return res.status(404).json({

                success: false,

                message:
                    "Customer not found"

            });
        }


        res.status(200).json({

            success: true,

            data:
                customer

        });

    } catch (error) {

        console.error(
            "Get customer error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch customer"

        });
    }
};


/* =========================
   GET CUSTOMER PROFILE
========================= */

const getCustomerProfile = async (req, res) => {

    try {

        const { id } =
            req.params;


        const profile =
            await customerService.getCustomerProfile(id);


        if (!profile) {

            return res.status(404).json({

                success: false,

                message:
                    "Customer not found"

            });
        }


        res.status(200).json({

            success: true,

            data:
                profile

        });

    } catch (error) {

        console.error(
            "Customer profile error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch customer profile"

        });
    }
};


/* =========================
   CREATE CUSTOMER
========================= */

const createCustomer = async (req, res) => {

    try {

        const {

            firstName,

            lastName,

            email,

            phone,

            dateOfBirth,

            occupation,

            address,

            city,

            state,

            password

        } = req.body;


        /* =========================
           VALIDATION
        ========================= */

        if (

            !firstName ||

            !email ||

            !phone ||

            !dateOfBirth ||

            !occupation ||

            !city ||

            !password

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please provide all required customer details"

            });
        }


        /* =========================
           HASH PASSWORD
        ========================= */

        const passwordHash =
            await bcrypt.hash(
                password,
                10
            );


        /* =========================
           CREATE CUSTOMER
        ========================= */

        const customer =
            await customerService.createCustomer({

                firstName,

                lastName,

                email,

                phone,

                dateOfBirth,

                occupation,

                address,

                city,

                state,

                passwordHash

            });


        res.status(201).json({

            success: true,

            message:
                "Customer registered successfully",

            data:
                customer

        });

    } catch (error) {

        console.error(
            "Create customer error:",
            error
        );


        if (
            error.code === "23505"
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "Email or phone number already exists"

            });
        }


        res.status(500).json({

            success: false,

            message:
                "Failed to register customer",

            error:
                error.message

        });
    }
};


/* =========================
   CUSTOMER LOGIN
========================= */

const loginCustomer = async (req, res) => {

    try {

        const {
            userId,
            password
        } = req.body;


        /* =========================
           VALIDATION
        ========================= */

        if (
            !userId ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "User ID and password are required"

            });
        }


        /* =========================
           FIND CUSTOMER
        ========================= */

        const customer =
            await customerService.getCustomerByLoginId(
                userId
            );


        if (!customer) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid User ID or password"

            });
        }


        /* =========================
           CHECK STATUS
        ========================= */

        if (
            customer.status !== "active"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Customer account is not active"

            });
        }


        /* =========================
           CHECK PASSWORD
        ========================= */

        if (
            !customer.password_hash
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Password is not configured for this account"

            });
        }


        const passwordMatch =
            await bcrypt.compare(

                password,

                customer.password_hash

            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid User ID or password"

            });
        }


        /* =========================
           LOGIN SUCCESS
        ========================= */

        res.status(200).json({

            success: true,

            message:
                "Login successful",

            data: {

                id:
                    customer.id,

                customerCode:
                    customer.customer_code,

                firstName:
                    customer.first_name,

                lastName:
                    customer.last_name,

                email:
                    customer.email,

                phone:
                    customer.phone

            }

        });

    } catch (error) {

        console.error(
            "Customer login error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Login failed",

            error:
                error.message

        });
    }
};


/* =========================
   CUSTOMER INSIGHTS
========================= */

const getCustomerInsights = async (req, res) => {

    try {

        const { id } =
            req.params;


        const profile =
            await customerService.getCustomerProfile(id);


        if (!profile) {

            return res.status(404).json({

                success: false,

                message:
                    "Customer not found"

            });
        }


        const insights = [];


        const income =
            profile.financialProfile.monthlyIncome || 0;


        const expenses =
            profile.financialProfile.monthlyExpenses || 0;


        const savings =
            profile.financialProfile.estimatedMonthlySavings || 0;


        /* =========================
           SAVINGS INSIGHT
        ========================= */

        if (
            savings > 0
        ) {

            insights.push({

                type:
                    "savings",

                priority:
                    "high",

                title:
                    "Savings Opportunity",

                message:
                    `You have an estimated monthly surplus of ₹${savings.toLocaleString("en-IN")}. Consider allocating a portion of it toward your financial goal.`

            });
        }


        /* =========================
           TRANSACTIONS
        ========================= */

        const transactions =
            profile.transactions || [];


        const hasTravelTransaction =
            transactions.some(

                transaction =>
                    transaction.category ===
                    "travel"

            );


        const hasShoppingTransaction =
            transactions.some(

                transaction =>
                    transaction.category ===
                    "shopping"

            );


        /* =========================
           TRAVEL INSIGHT
        ========================= */

        if (
            hasTravelTransaction
        ) {

            insights.push({

                type:
                    "travel",

                priority:
                    "medium",

                title:
                    "Travel Spending Detected",

                message:
                    "Recent travel spending was detected. Consider using a travel-focused banking product to maximize rewards on future trips."

            });
        }


        /* =========================
           SHOPPING INSIGHT
        ========================= */

        if (
            hasShoppingTransaction
        ) {

            insights.push({

                type:
                    "shopping",

                priority:
                    "medium",

                title:
                    "Shopping Spending Detected",

                message:
                    "Recent online shopping activity was detected. A cashback product may help reduce your routine spending."

            });
        }


        /* =========================
           RISK INSIGHT
        ========================= */

        if (

            profile.financialProfile.riskProfile ===
            "moderate"

            &&

            savings > 0

        ) {

            insights.push({

                type:
                    "risk",

                priority:
                    "medium",

                title:
                    "Wealth Building Opportunity",

                message:
                    "Your moderate risk profile and positive monthly surplus indicate an opportunity to build your savings and long-term wealth gradually."

            });
        }


        res.status(200).json({

            success: true,

            customerId:
                id,

            count:
                insights.length,

            data:
                insights

        });

    } catch (error) {

        console.error(
            "Customer insights error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to generate customer insights",

            error:
                error.message

        });
    }
};


/* =========================
   EXPORT
========================= */

module.exports = {

    getAllCustomers,

    getCustomerById,

    getCustomerProfile,

    createCustomer,

    loginCustomer,

    getCustomerInsights

};