const pool = require("../config/database");

const getAllProducts = async () => {
    const result = await pool.query(`
        SELECT
            id,
            product_code,
            name,
            type,
            description,
            minimum_age,
            maximum_age,
            minimum_income,
            interest_rate,
            minimum_balance,
            features,
            eligibility_rules,
            status
        FROM products
        WHERE status = 'active'
        ORDER BY id;
    `);

    return result.rows;
};

const getProductById = async (id) => {
    const result = await pool.query(
        `
        SELECT
            id,
            product_code,
            name,
            type,
            description,
            minimum_age,
            maximum_age,
            minimum_income,
            interest_rate,
            minimum_balance,
            features,
            eligibility_rules,
            status
        FROM products
        WHERE id = $1
        AND status = 'active';
        `,
        [id]
    );

    return result.rows[0];
};

module.exports = {
    getAllProducts,
    getProductById
};