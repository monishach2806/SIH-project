const pool = require("../config/database");


/* =========================
   GET ALL CUSTOMERS
========================= */

const getAllCustomers = async () => {

    const result = await pool.query(`
        SELECT
            id,
            customer_code,
            first_name,
            last_name,
            email,
            phone,
            date_of_birth,
            age,
            occupation,
            monthly_income,
            monthly_expenses,
            city,
            state,
            financial_goal,
            risk_profile,
            digital_adoption_score,
            engagement_score,
            status,
            created_at
        FROM customers
        ORDER BY id;
    `);

    return result.rows;
};


/* =========================
   GET CUSTOMER BY ID
========================= */

const getCustomerById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            id,
            customer_code,
            first_name,
            last_name,
            email,
            phone,
            date_of_birth,
            age,
            occupation,
            monthly_income,
            monthly_expenses,
            city,
            state,
            financial_goal,
            risk_profile,
            digital_adoption_score,
            engagement_score,
            status,
            created_at
        FROM customers
        WHERE id = $1;
        `,
        [id]
    );

    return result.rows[0];
};


/* =========================
   GET CUSTOMER PROFILE
========================= */

const getCustomerProfile = async (customerId) => {

    /* =========================
       1. GET CUSTOMER
    ========================= */

    const customerResult = await pool.query(
        `
        SELECT
            id,
            customer_code,
            first_name,
            last_name,
            email,
            phone,
            age,
            occupation,
            monthly_income,
            monthly_expenses,
            city,
            state,
            financial_goal,
            risk_profile,
            digital_adoption_score,
            engagement_score,
            status
        FROM customers
        WHERE id = $1;
        `,
        [customerId]
    );

    const customer =
        customerResult.rows[0];


    if (!customer) {
        return null;
    }


    /* =========================
       2. GET ACCOUNTS
    ========================= */

    const accountsResult = await pool.query(
        `
        SELECT
            a.id,
            a.account_number,
            a.balance,
            a.currency,
            a.status,
            p.product_code,
            p.name AS product_name,
            p.type AS product_type
        FROM accounts a
        JOIN products p
            ON a.product_id = p.id
        WHERE a.customer_id = $1
        ORDER BY a.id;
        `,
        [customerId]
    );


    /* =========================
       3. GET TRANSACTIONS
    ========================= */

    const transactionsResult = await pool.query(
        `
        SELECT
            t.id,
            t.transaction_reference,
            t.transaction_type,
            t.amount,
            t.description,
            t.merchant_name,
            t.transaction_category,
            t.transaction_status,
            t.transaction_time
        FROM transactions t
        JOIN accounts a
            ON t.account_id = a.id
        WHERE a.customer_id = $1
        ORDER BY
            t.transaction_time DESC,
            t.id DESC
        LIMIT 20;
        `,
        [customerId]
    );


    /* =========================
       4. FINANCIAL PROFILE
    ========================= */

    const income =
        Number(customer.monthly_income || 0);

    const expenses =
        Number(customer.monthly_expenses || 0);

    const estimatedMonthlySavings =
        income - expenses;


    /* =========================
       5. TOTAL BALANCE
    ========================= */

    const totalBalance =
        accountsResult.rows.reduce(
            (total, account) =>
                total +
                Number(account.balance || 0),
            0
        );


    /* =========================
       6. CUSTOMER 360
    ========================= */

    return {

        customer: {

            id:
                customer.id,

            customerCode:
                customer.customer_code,

            name:
                `${customer.first_name} ${customer.last_name || ""}`.trim(),

            email:
                customer.email,

            phone:
                customer.phone,

            age:
                customer.age,

            occupation:
                customer.occupation,

            city:
                customer.city,

            state:
                customer.state,

            status:
                customer.status
        },


        financialProfile: {

            monthlyIncome:
                income,

            monthlyExpenses:
                expenses,

            estimatedMonthlySavings:
                estimatedMonthlySavings,

            financialGoal:
                customer.financial_goal,

            riskProfile:
                customer.risk_profile
        },


        accounts:
            accountsResult.rows.map(
                account => ({

                    id:
                        account.id,

                    accountNumber:
                        account.account_number,

                    balance:
                        Number(account.balance),

                    currency:
                        account.currency,

                    status:
                        account.status,

                    productCode:
                        account.product_code,

                    productName:
                        account.product_name,

                    productType:
                        account.product_type

                })
            ),


        transactions:
            transactionsResult.rows.map(
                transaction => ({

                    id:
                        transaction.id,

                    reference:
                        transaction.transaction_reference,

                    type:
                        transaction.transaction_type,

                    amount:
                        Number(transaction.amount),

                    description:
                        transaction.description,

                    merchant:
                        transaction.merchant_name,

                    category:
                        transaction.transaction_category,

                    status:
                        transaction.transaction_status,

                    time:
                        transaction.transaction_time

                })
            ),


        behavior: {

            digitalAdoptionScore:
                Number(
                    customer.digital_adoption_score
                ),

            engagementScore:
                Number(
                    customer.engagement_score
                ),

            totalBalance:
                totalBalance
        }

    };
};


/* =========================
   GET CUSTOMER FOR LOGIN
========================= */

const getCustomerByLoginId = async (userId) => {

    const result = await pool.query(
        `
        SELECT
            id,
            customer_code,
            first_name,
            last_name,
            email,
            phone,
            password_hash,
            status
        FROM customers
        WHERE
            customer_code = $1
            OR phone = $1
            OR email = $1
        LIMIT 1;
        `,
        [userId]
    );

    return result.rows[0];
};


/* =========================
   CREATE CUSTOMER
========================= */

const createCustomer = async (customerData) => {

    const {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        occupation,
        city,
        state,
        passwordHash
    } = customerData;


    /* =========================
       GENERATE CUSTOMER CODE
    ========================= */

    const codeResult = await pool.query(`
        SELECT customer_code
        FROM customers
        ORDER BY id DESC
        LIMIT 1;
    `);


    let customerCode =
        "CUST001";


    if (codeResult.rows.length > 0) {

        const lastCode =
            codeResult.rows[0].customer_code;


        const lastNumber =
            parseInt(
                lastCode.replace("CUST", ""),
                10
            );


        customerCode =
            "CUST" +
            String(
                lastNumber + 1
            ).padStart(3, "0");
    }


    /* =========================
       INSERT CUSTOMER
    ========================= */

    const result = await pool.query(
        `
        INSERT INTO customers
        (
            customer_code,
            first_name,
            last_name,
            email,
            phone,
            date_of_birth,
            occupation,
            city,
            state,
            password_hash,
            status
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            'active'
        )
        RETURNING
            id,
            customer_code,
            first_name,
            last_name,
            email,
            phone,
            date_of_birth,
            occupation,
            city,
            state,
            status,
            created_at;
        `,
        [
            customerCode,
            firstName,
            lastName || null,
            email,
            phone,
            dateOfBirth,
            occupation,
            city,
            state || null,
            passwordHash
        ]
    );


    return result.rows[0];
};


/* =========================
   EXPORT
========================= */

module.exports = {

    getAllCustomers,

    getCustomerById,

    getCustomerProfile,

    getCustomerByLoginId,

    createCustomer

};