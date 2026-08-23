require("dotenv").config();

const express = require("express");

const productRoutes = require("./routes/products.routes");
const customerRoutes = require("./routes/customers.routes");
const aiRoutes = require("./routes/ai.routes");
const kycRoutes = require("./routes/kyc.routes");

const pool = require("./config/database");

const app = express();

const PORT = process.env.PORT || 3000;


// =========================
// BODY PARSER
// =========================

app.use(express.json());


// =========================
// CORS
// =========================

app.use((req, res, next) => {

    res.header(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );

    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );


    if (req.method === "OPTIONS") {

        return res.sendStatus(204);

    }


    next();

});


// =========================
// HEALTH CHECK
// =========================

app.get("/api/health", (req, res) => {

    res.status(200).json({

        success: true,

        message:
            "BankMind AI Backend is running",

        service:
            "Node.js + Express",

        timestamp:
            new Date().toISOString()

    });

});


// =========================
// DATABASE TEST
// =========================

app.get("/api/db-test", async (req, res) => {

    try {

        const result =
            await pool.query(
                "SELECT NOW()"
            );


        res.status(200).json({

            success: true,

            message:
                "PostgreSQL connection working",

            databaseTime:
                result.rows[0].now

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({

            success: false,

            message:
                "Database connection failed",

            error:
                error.message

        });

    }

});


// =========================
// API ROUTES
// =========================

app.use(
    "/api/products",
    productRoutes
);


app.use(
    "/api/customers",
    customerRoutes
);


app.use(
    "/api/ai",
    aiRoutes
);


app.use(
    "/api/kyc",
    kycRoutes
);


// =========================
// START SERVER
// =========================

app.listen(
    PORT,
    () => {

        console.log(
            `BankMind AI Backend running on http://localhost:${PORT}`
        );

    }
);