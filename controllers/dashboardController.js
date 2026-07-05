const pool =
require("../config/db");

exports.getStats =
async (req, res) => {
  try {

    const surgeonId =
      req.user.id;

    const total =
      await pool.query(
        `
        SELECT COUNT(*)
        FROM consents
        WHERE surgeon_id=$1
        `,
        [surgeonId]
      );

    const completed =
      await pool.query(
        `
        SELECT COUNT(*)
        FROM consents
        WHERE surgeon_id=$1
        AND status='Completed'
        `,
        [surgeonId]
      );

    res.json({
      consentRequests:
        parseInt(
          total.rows[0].count
        ),

      completed:
        parseInt(
          completed.rows[0].count
        )
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message:
        "Server Error"
    });
  }
};

exports.getRecentConsents =
async (req, res) => {
  try {

    const result =
      await pool.query(
        `
        SELECT
          c.id,
          p.full_name,
          pr.name AS procedure_name,
          c.status,
          c.created_at
        FROM consents c
        JOIN patients p
          ON c.patient_id = p.id
        LEFT JOIN procedures pr
          ON c.procedure_id = pr.id
        WHERE c.surgeon_id = $1
        ORDER BY c.created_at DESC
        LIMIT 5
        `,
        [req.user.id]
      );

    res.json(
      result.rows
    );

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message:
        "Server Error"
    });
  }
};