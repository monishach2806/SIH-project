const pool = require("../config/database");

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

const getCustomerProfile = async (customerId) => {
    // 1. Get customer
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

    const customer = customerResult.rows[0];

    if (!customer) {
        return null;
    }

    // 2. Get accounts
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

    // 3. Get recent transactions
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
        ORDER BY t.transaction_time DESC, t.id DESC
        LIMIT 20;
        `,
        [customerId]
    );

    // 4. Calculate financial profile
    const income = Number(customer.monthly_income || 0);
    const expenses = Number(customer.monthly_expenses || 0);

    const estimatedMonthlySavings = income - expenses;

    // 5. Calculate account balance
    const totalBalance = accountsResult.rows.reduce(
        (total, account) => total + Number(account.balance || 0),
        0
    );

    // 6. Return Customer 360
    return {
        customer: {
            id: customer.id,
            customerCode: customer.customer_code,
            name: `${customer.first_name} ${customer.last_name || ""}`.trim(),
            email: customer.email,
            phone: customer.phone,
            age: customer.age,
            occupation: customer.occupation,
            city: customer.city,
            state: customer.state,
            status: customer.status
        },

        financialProfile: {
            monthlyIncome: income,
            monthlyExpenses: expenses,
            estimatedMonthlySavings,
            financialGoal: customer.financial_goal,
            riskProfile: customer.risk_profile
        },

        accounts: accountsResult.rows.map(account => ({
            id: account.id,
            accountNumber: account.account_number,
            balance: Number(account.balance),
            currency: account.currency,
            status: account.status,
            productCode: account.product_code,
            productName: account.product_name,
            productType: account.product_type
        })),

        transactions: transactionsResult.rows.map(transaction => ({
            id: transaction.id,
            reference: transaction.transaction_reference,
            type: transaction.transaction_type,
            amount: Number(transaction.amount),
            description: transaction.description,
            merchant: transaction.merchant_name,
            category: transaction.transaction_category,
            status: transaction.transaction_status,
            time: transaction.transaction_time
        })),

        behavior: {
            digitalAdoptionScore: Number(customer.digital_adoption_score),
            engagementScore: Number(customer.engagement_score),
            totalBalance
        }
    };
};

module.exports = {
    getAllCustomers,
    getCustomerById,
    getCustomerProfile
};