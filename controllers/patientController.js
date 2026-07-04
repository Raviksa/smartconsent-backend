const pool =
require("../config/db");

exports.createPatient =
async (req, res) => {
  try {
    const {
  surgeon_id,
  full_name,
  age,
  gender,
  phone,
  email,
  address,
  mrn,
  diagnosis,
  side,
  suggested_procedure,
  notes
} = req.body;

    const result =
await pool.query(
`
INSERT INTO patients
(
  surgeon_id,
  full_name,
  age,
  gender,
  phone,
  email,
  address,
  mrn,
  diagnosis,
  side,
  suggested_procedure,
  notes
)
VALUES
(
  $1,$2,$3,$4,$5,$6,
  $7,$8,$9,$10,$11,$12
)
RETURNING *
`,
[
  surgeon_id,
  full_name,
  age,
  gender,
  phone,
  email,
  address,
  mrn,
  diagnosis,
  side,
  suggested_procedure,
  notes
]
);

    res.json(
      result.rows[0]
    );

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message:
      "Server Error"
    });
  }
};
exports.getPatients =
async (req, res) => {
  try {
    const result =
      await pool.query(
        `
        SELECT *
        FROM patients
        ORDER BY id DESC
        `
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

exports.deletePatient =
async (req, res) => {
  try {

    await pool.query(
      `
      DELETE
      FROM patients
      WHERE id=$1
      `,
      [req.params.id]
    );

    res.json({
      message:
      "Patient Deleted"
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message:
      "Server Error"
    });
  }
};

exports.updatePatient =
async (req,res) => {

  try {

    const {
      full_name,
      age,
      gender,
      phone,
      email,
      address,
      mrn,
      diagnosis,
      side,
      suggested_procedure,
      notes
    } = req.body;

    const result =
    await pool.query(
      `
      UPDATE patients
      SET
      full_name=$1,
      age=$2,
      gender=$3,
      phone=$4,
      email=$5,
      address=$6,
      mrn=$7,
      diagnosis=$8,
      side=$9,
      suggested_procedure=$10,
      notes=$11
      WHERE id=$12
      RETURNING *
      `,
      [
        full_name,
        age,
        gender,
        phone,
        email,
        address,
        mrn,
        diagnosis,
        side,
        suggested_procedure,
        notes,
        req.params.id
      ]
    );

    res.json(
      result.rows[0]
    );

  } catch(err){

    console.log(err);

    res.status(500).json({
      message:
      "Server Error"
    });
  }
};