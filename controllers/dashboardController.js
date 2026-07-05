const pool =
require("../config/db");

exports.getStats =
async (req,res)=>{

  try{

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

  }catch(err){

    console.log(err);

    res.status(500).json({
      message:
      "Server Error"
    });
  }
};