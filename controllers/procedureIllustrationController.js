const pool =
require("../config/db");

exports.getIllustrations =
async (req,res) => {
  try {

    const result =
      await pool.query(
        `
        SELECT *
        FROM procedure_illustrations
        ORDER BY sequence_no
        `
      );

    res.json(
      result.rows
    );

  } catch(err) {

    console.log(err);

    res.status(500).json({
      message:
      "Server Error"
    });
  }
};