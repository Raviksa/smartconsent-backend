const path = require("path");
const PDFDocument = require("pdfkit");
const pool = require("../config/db");

exports.generatePdf = async (req, res) => {

  try {

    const {
      patient,
      procedure,
      consent,
      illustrations,
      language
    } = req.body;

    // Save consent to database
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

    // ---------------------------------
    // Create PDF
    // ---------------------------------

    const doc = new PDFDocument({
      margin: 50,
      size: "A4"
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Consent.pdf"
    );

    doc.pipe(res);

    // ---------------------------------
    // Register Fonts
    // ---------------------------------

    doc.registerFont(
      "English",
      path.join(__dirname, "../fonts/NotoSans-Regular.ttf")
    );

    doc.registerFont(
      "EnglishBold",
      path.join(__dirname, "../fonts/NotoSans-Bold.ttf")
    );

    doc.registerFont(
      "Devanagari",
      path.join(__dirname, "../fonts/NotoSansDevanagari-Regular.ttf")
    );
    doc.registerFont(
      "Tamil",
      path.join(__dirname, "../fonts/NotoSansTamil-Regular.ttf")
    );

    doc.registerFont(
      "Gujarati",
      path.join(__dirname, "../fonts/NotoSansGujarati-Regular.ttf")
    );

    
    // ---------------------------------
    // Clean markdown
    // ---------------------------------

    const cleanConsent = consent
      .replace(/\*\*/g, "")
      .replace(/^\*\s/gm, "• ")
      .replace(/\\_/g, "_");

    // ---------------------------------
    // Split English / Regional
    // ---------------------------------

    let englishConsent = cleanConsent;
    let regionalConsent = "";

    if (language !== "English") {

      const parts =
        cleanConsent.split(
          "========================"
        );

      if (parts.length >= 5) {

        englishConsent = parts[2].trim();

        regionalConsent = parts[4].trim();

      }

    }

    // ---------------------------------
    // PAGE 1
    // ---------------------------------

    doc
      .font("EnglishBold")
      .fontSize(22)
      .text(
        "SMARTCONSENT SOLUTIONS",
        {
          align: "center"
        }
      );

    doc.moveDown(0.5);

    doc
      .font("EnglishBold")
      .fontSize(18)
      .text(
        "INFORMED CONSENT",
        {
          align: "center"
        }
      );

    doc.moveDown(2);

    doc
      .font("EnglishBold")
      .fontSize(16)
      .text("Patient Information");

    doc.moveDown();

    doc
      .font("English")
      .fontSize(12);

    doc.text(`Patient Name : ${patient.full_name}`);
    doc.text(`Age          : ${patient.age}`);
    doc.text(`Gender       : ${patient.gender || "Not Specified"}`);
    doc.text(`Diagnosis    : ${patient.diagnosis}`);
    doc.text(`Procedure    : ${procedure.name}`);

    doc.text(
      `Date         : ${new Date().toLocaleDateString()}`
    );
        // ---------------------------------
    // PAGE 2
    // Procedure Illustrations
    // ---------------------------------

    if (
      illustrations &&
      illustrations.length > 0
    ) {

      doc.addPage();

      doc
        .font("EnglishBold")
        .fontSize(20)
        .text(
          "Procedure Illustrations",
          {
            align: "center"
          }
        );

      doc.moveDown(2);

      for (const illustration of illustrations) {

        try {

          const imagePath = path.join(
            __dirname,
            "..",
            "public",
            illustration.image_url.replace(/^\/+/, "")
          );

          doc.image(
            imagePath,
            {
              fit: [350, 250],
              align: "center"
            }
          );

          doc.moveDown();

          doc
            .font("English")
            .fontSize(12)
            .text(
              illustration.caption,
              {
                align: "center"
              }
            );

          doc.moveDown(2);

        } catch (err) {

          console.log(
            "Unable to load illustration:",
            illustration.image_url
          );

        }

      }

    }

    // ---------------------------------
    // PAGE 3
    // English Consent
    // ---------------------------------

    doc.addPage();

    doc
      .font("EnglishBold")
      .fontSize(20)
      .text(
        "Consent Document (English)",
        {
          align: "center"
        }
      );

    doc.moveDown(2);

    doc
      .font("English")
      .fontSize(11)
      .text(
        englishConsent,
        {
          align: "left"
        }
      );

    // ---------------------------------
    // PAGE 4
    // Regional Language
    // ---------------------------------

    if (
      language !== "English" &&
      regionalConsent.trim() !== ""
    ) {
     
      doc.addPage();

      let regionalFont = "English";

      switch (language) {

        case "Marathi":
        case "Hindi":
          regionalFont = "Devanagari";
          break;

        case "Gujarati":
          regionalFont = "Gujarati";
          break;

        case "Tamil":
          regionalFont = "Tamil";
          break;

      }
      console.log("Language:", language);
console.log("Regional Font:", regionalFont)

      doc
        .font("EnglishBold")
        .fontSize(20)
        .text(
          `Consent Document (${language})`,
          {
            align: "center"
          }
        );

      doc.moveDown(2);

      doc
        .font(regionalFont)
        .fontSize(11)
        .text(
          regionalConsent,
          {
            align: "left"
          }
        );

    }
        // ---------------------------------
    // FINAL PAGE
    // Signatures
    // ---------------------------------

    doc.addPage();

    doc
      .font("EnglishBold")
      .fontSize(20)
      .text(
        "Signatures",
        {
          align: "center"
        }
      );

    doc.moveDown(3);

    doc
      .font("English")
      .fontSize(12);

    // Patient Signature

    doc.text("Patient Signature");

    doc.moveTo(180, doc.y)
       .lineTo(500, doc.y)
       .stroke();

    doc.moveDown(2);

    // Relative Signature

    doc.text("Relative Signature");

    doc.moveTo(180, doc.y)
       .lineTo(500, doc.y)
       .stroke();

    doc.moveDown(2);

    // Witness Signature

    doc.text("Witness Signature");

    doc.moveTo(180, doc.y)
       .lineTo(500, doc.y)
       .stroke();

    doc.moveDown(2);

    // Surgeon Signature

    doc.text("Surgeon Signature");

    doc.moveTo(180, doc.y)
       .lineTo(500, doc.y)
       .stroke();

    doc.moveDown(3);

    doc.text(
      `Date : ${new Date().toLocaleDateString()}`
    );

    doc.text(
      "Time : __________________"
    );

    doc.moveDown(4);

    doc
      .fontSize(9)
      .fillColor("gray")
      .text(
        "This document is an AI-generated draft intended as an educational and documentation aid. The final informed consent must be reviewed, modified if necessary, and approved by the treating surgeon before clinical use.",
        {
          align: "center"
        }
      );

    // ---------------------------------
    // Finish PDF
    // ---------------------------------

    doc.end();

  } catch (err) {

    console.error(err);

    if (!res.headersSent) {

      res.status(500).json({
        message: "PDF Error"
      });

    }

  }

};