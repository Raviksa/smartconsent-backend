const path = require("path");
const PDFDocument = require("pdfkit");
const pool = require("../config/db");
exports.generatePdf =
async (req, res) => {
 

  try {

    const {
      patient,
      procedure,
      consent,
      illustrations
    } = req.body;
    await pool.query(
`
INSERT INTO consents
(
  surgeon_id,
  patient_id,
  procedure_id,
  consent_text,
  status
)
VALUES
($1,$2,$3,$4,$5)
`,
[
  req.user.id,
  patient.id,
  procedure.id,
  consent,
  "Completed"
]

);
    const doc =
      new PDFDocument({
        margin: 50
      });
doc.registerFont(
  "English",
  path.join(__dirname,"../fonts/NotoSans-Regular.ttf")
);

doc.registerFont(
  "EnglishBold",
  path.join(__dirname,"../fonts/NotoSans-Bold.ttf")
);

doc.registerFont(
  "Devanagari",
  path.join(__dirname,"../fonts/NotoSansDevanagari-Regular.ttf")
);

doc.registerFont(
  "Gujarati",
  path.join(__dirname,"../fonts/NotoSansGujarati-Regular.ttf")
);

doc.registerFont(
  "Tamil",
  path.join(__dirname,"../fonts/NotoSansTamil-Regular.ttf")
);
    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Consent.pdf"
    );

    doc.pipe(res);

    // ==================================
    // PAGE 1
    // ==================================

    doc
      .fontSize(22)
      .text(
        "INFORMED CONSENT",
        {
          align: "center"
        }
      );

    doc.moveDown(2);

    doc
      .fontSize(16)
      .text(
        "Patient Information"
      );

    doc.moveDown();

    doc
      .fontSize(12)
      .text(
        `Patient Name: ${patient.full_name}`
      );
let fontName = "English";

if (
  consent.match(/[\u0900-\u097F]/)
) {
  fontName = "Devanagari";
}
else if (
  consent.match(/[\u0A80-\u0AFF]/)
) {
  fontName = "Gujarati";
}
else if (
  consent.match(/[\u0B80-\u0BFF]/)
) {
  fontName = "Tamil";
}

doc.font(fontName);

doc.text(
  consent,
  {
    align: "left"
  }
);
    doc.text(
      `Age: ${patient.age}`
    );

    doc.text(
      `Gender: ${
        patient.gender ||
        "Not Specified"
      }`
    );

    doc.text(
      `Diagnosis: ${patient.diagnosis}`
    );

    doc.text(
      `Procedure: ${procedure.name}`
    );

    doc.moveDown(2);

    doc.text(
      `Date: ${
        new Date()
          .toLocaleDateString()
      }`
    );

    // ==================================
    // PAGE 2
    // ==================================

    if (
      illustrations &&
      illustrations.length > 0
    ) {

      doc.addPage();

      doc
        .fontSize(20)
        .text(
          "Procedure Illustrations",
          {
            align:
              "center"
          }
        );

      doc.moveDown(2);

      for (
        const illustration
        of illustrations
      ) {

        try {

          const imagePath =
            path.join(
              __dirname,
              "..",
              "public",
              illustration.image_url.replace(
                /^\/+/,
                ""
              )
            );

          doc.image(
            imagePath,
            {
              fit:
                [300, 200],
              align:
                "center"
            }
          );

          doc.moveDown();

          doc
            .fontSize(12)
            .text(
              illustration.caption,
              {
                align:
                  "center"
              }
            );

          doc.moveDown(2);

        } catch (err) {

          console.log(
            "Image error:",
            illustration.image_url
          );

          console.log(err);
        }
      }
    }

    // ==================================
    // PAGE 3+
    // ==================================

    doc.addPage();

    doc
      .fontSize(20)
      .text(
        "Consent Document",
        {
          align:
            "center"
        }
      );

    doc.moveDown(2);

    doc
      .fontSize(11)
      .text(
        consent,
        {
          align:
            "left"
        }
      );

    // ==================================
    // SIGNATURE PAGE
    // ==================================

    doc.addPage();

    doc
      .fontSize(20)
      .text(
        "Signatures",
        {
          align:
            "center"
        }
      );

    doc.moveDown(4);

    doc.text(
      "Patient Signature:"
    );

    doc.moveDown(3);

    doc.text(
      "Relative Signature:"
    );

    doc.moveDown(3);

    doc.text(
      "Witness Signature:"
    );

    doc.moveDown(3);

    doc.text(
      "Surgeon Signature:"
    );

    doc.moveDown(3);

    doc.text(
      "Date: __________________"
    );

    doc.text(
      "Time: __________________"
    );

    doc.end();

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message:
        "PDF Error"
    });
  }
};