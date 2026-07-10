const pool = require("../config/db");

exports.updateProfile = async (req, res) => {

  try {
   
    const {
      full_name,
      speciality,
      hospital_name,
      phone
    } = req.body;

    const result =
      await pool.query(
        `
        UPDATE surgeons
        SET
          full_name=$1,
          speciality=$2,
          hospital_name=$3,
          phone=$4
        WHERE id=$5
        RETURNING *
        `,
        [
          full_name,
          speciality,
          hospital_name,
          phone,
          req.user.id
        ]
      );
 
    res.json(result.rows[0]);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message:"Server Error"
    });

  }

};