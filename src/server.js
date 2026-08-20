require("dotenv").config();

const express = require("express");
const productRoutes = require("./routes/products.routes");
const customerRoutes = require("./routes/customers.routes");
const aiRoutes = require("./routes/ai.routes");

const pool = require("./config/database");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "BankMind AI Backend is running",
        service: "Node.js + Express",
        timestamp: new Date().toISOString()
    });
});

app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.status(200).json({
            success: true,
            message: "PostgreSQL connection working",
            databaseTime: result.rows[0].now
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error:error.message
        });
    }
});


app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/ai", aiRoutes);

app.listen(PORT, () => {
    console.log(`BankMind AI Backend running on http://localhost:${PORT}`);
});