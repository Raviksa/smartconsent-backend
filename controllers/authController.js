const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// REGISTER
exports.register = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      speciality,
      hospital_name,
      phone
    } = req.body;

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const result =
      await pool.query(
        `
        INSERT INTO surgeons
        (
          full_name,
          email,
          password,
          speciality,
          hospital_name,
          phone
        )
        VALUES
        ($1,$2,$3,$4,$5,$6)
        RETURNING *
        `,
        [
          full_name,
          email,
          hashedPassword,
          speciality,
          hospital_name,
          phone
        ]
      );

    res.json(result.rows[0]);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {

    const {
      email,
      password
    } = req.body;

    const user =
      await pool.query(
        `
        SELECT *
        FROM surgeons
        WHERE email=$1
        `,
        [email]
      );

    if (user.rows.length === 0) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.rows[0].password
      );

    if (!validPassword) {
      return res.status(400).json({
        message: "Wrong password"
      });
    }

    const token =
      jwt.sign(
        {
          id: user.rows[0].id
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d"
        }
      );

    res.json({
      token,
      user: user.rows[0]
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });
  }
};