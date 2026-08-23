const pool = require("../config/database");

const createKYC = async (data) => {
    const {
        customerId,
        documentType,
        documentNumber,
        fullName,
        dateOfBirth,
        address,
        city,
        state,
        postalCode
    } = data;

    // Check customer exists
    const customerResult = await pool.query(
        `SELECT id FROM customers WHERE id = $1`,
        [customerId]
    );

    if (customerResult.rows.length === 0) {
        throw new Error("Customer not found");
    }

    // Check if customer already has pending/approved KYC
    const existingResult = await pool.query(
        `
        SELECT id, status
        FROM kyc_records
        WHERE customer_id = $1
        ORDER BY id DESC
        LIMIT 1
        `,
        [customerId]
    );

    if (
        existingResult.rows.length > 0 &&
        ["pending", "approved"].includes(existingResult.rows[0].status)
    ) {
        throw new Error(
            `KYC already exists with status: ${existingResult.rows[0].status}`
        );
    }

    const result = await pool.query(
        `
        INSERT INTO kyc_records (
            customer_id,
            document_type,
            document_number,
            full_name,
            date_of_birth,
            address,
            city,
            state,
            postal_code
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *
        `,
        [
            customerId,
            documentType,
            documentNumber,
            fullName,
            dateOfBirth || null,
            address || null,
            city || null,
            state || null,
            postalCode || null
        ]
    );

    return result.rows[0];
};


const getKYCByCustomerId = async (customerId) => {

    const result = await pool.query(
        `
        SELECT *
        FROM kyc_records
        WHERE customer_id = $1
        ORDER BY id DESC
        LIMIT 1
        `,
        [customerId]
    );

    return result.rows[0];
};


const getAllKYC = async () => {

    const result = await pool.query(
        `
        SELECT
            k.id,
            k.customer_id,
            c.customer_code,
            c.first_name,
            c.last_name,
            c.email,
            k.document_type,
            k.document_number,
            k.full_name,
            k.date_of_birth,
            k.address,
            k.city,
            k.state,
            k.postal_code,
            k.status,
            k.rejection_reason,
            k.submitted_at,
            k.reviewed_at
        FROM kyc_records k
        JOIN customers c
            ON k.customer_id = c.id
        ORDER BY k.submitted_at DESC
        `
    );

    return result.rows;
};


const updateKYCStatus = async (
    kycId,
    status,
    rejectionReason = null
) => {

    const result = await pool.query(
        `
        UPDATE kyc_records
        SET
            status = $1,
            rejection_reason = $2,
            reviewed_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
        `,
        [status, rejectionReason, kycId]
    );

    return result.rows[0];
};


module.exports = {
    createKYC,
    getKYCByCustomerId,
    getAllKYC,
    updateKYCStatus
};