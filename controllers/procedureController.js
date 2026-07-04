const pool =
require("../config/db");

exports.createProcedure =
async (req, res) => {
  try {

    const {
      speciality,
      name,
      description,
      video_url,
      consent_template
    } = req.body;

    const result =
      await pool.query(
        `
        INSERT INTO procedures
        (
          speciality,
          name,
          description,
          video_url,
          consent_template
        )
        VALUES
        (
          $1,$2,$3,$4,$5
        )
        RETURNING *
        `,
        [
          speciality,
          name,
          description,
          video_url,
          consent_template
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

exports.getProcedures =
async (req, res) => {
  try {

    const result =
      await pool.query(
        `
        SELECT *
        FROM procedures
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

exports.deleteProcedure =
async (req, res) => {
  try {

    await pool.query(
      `
      DELETE
      FROM procedures
      WHERE id=$1
      `,
      [req.params.id]
    );

    res.json({
      message:
      "Procedure Deleted"
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message:
      "Server Error"
    });
  }
};

exports.updateProcedure =
async (req, res) => {
  try {

    const {
      speciality,
      name,
      description,
      video_url,
      consent_template
    } = req.body;

    const result =
      await pool.query(
        `
        UPDATE procedures
        SET
        speciality=$1,
        name=$2,
        description=$3,
        video_url=$4,
        consent_template=$5
        WHERE id=$6
        RETURNING *
        `,
        [
          speciality,
          name,
          description,
          video_url,
          consent_template,
          req.params.id
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