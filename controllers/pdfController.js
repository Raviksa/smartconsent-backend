const path = require("path");
const PDFDocument = require("pdfkit");
const pool = require("../config/db");
const { splitConsent } = require("../helpers/splitConsent");

function drawFooter(doc, currentPage, totalPages) {

  const footerY = 780;

  doc
    .moveTo(50, footerY - 8)
    .lineTo(545, footerY - 8)
    .strokeColor("#DDDDDD")
    .stroke();

  doc
    .font("English")
    .fontSize(8)
    .fillColor("gray");

  // Left side
  doc.text(
    "Generated using SmartConsent Solutions",
    50,
    footerY
  );

  // Right side
  doc.text(
    `Page ${currentPage} of ${totalPages}`,
    420,
    footerY,
    {
      width: 120,
      align: "right"
    }
  );

  doc.fillColor("black");
}


exports.generatePdf = async (req, res) => {

  try {

    const {
      patient,
      procedure,
      consent,
      illustrations,
      language
    } = req.body;
    // Temporary (later load from database)
const hospitalResult = await pool.query(
`
SELECT hospital_name
FROM surgeons
WHERE id=$1
`,
[req.user.id]
);

const hospitalName =
hospitalResult.rows[0]?.hospital_name
|| "Hospital";


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
      size: "A4",
       bufferPages: true
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
      path.join(__dirname, "../fonts/MuktaVaani-Regular.ttf")
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

    const {
    englishConsent,
    regionalConsent
} = splitConsent(
    cleanConsent,
    language
);

    // ---------------------------------
    // PAGE 1
    //Procedure Illustrations (2×2 Grid)
    // Patient Information
//----------------------------------------

   doc
  .font("EnglishBold")
  .fontSize(22)
  .text(hospitalName,{
    align:"center"
  });



doc.moveDown(0.3);

doc
  .font("EnglishBold")
  .fontSize(18)
  .text("INFORMED CONSENT", {
    align: "center"
  });



doc.fillColor("black");

doc.moveDown();

    doc.moveDown(2);

    doc
      .font("EnglishBold")
      .fontSize(16)
      .text("Patient Information");

    doc.moveDown();

  doc
  .font("English")
 doc.fontSize(11);

const leftColumn = [
  ["Patient Name", patient.full_name],
  ["Gender", patient.gender || "-"],
  ["MRN", patient.mrn || "-"],
  ["Diagnosis", patient.diagnosis || "-"],
  ["Procedure",  procedure.name]
];

const rightColumn = [
  ["Age", `${patient.age} Years`],
  ["Phone", patient.phone || "-"],
  ["Side", patient.side || "-"],
  ["Language", language],
  ["Date", new Date().toLocaleDateString()]
];

let startY = doc.y;

for (let i = 0; i < leftColumn.length; i++) {

  const left = leftColumn[i];
  const right = rightColumn[i];

  doc
    .font("EnglishBold")
    .text(left[0], 50, startY);

  doc
    .font("English")
    .text(`: ${left[1]}`, 150, startY);

  doc
    .font("EnglishBold")
    .text(right[0], 310, startY);

  doc
    .font("English")
    .text(`: ${right[1]}`, 390, startY);

  startY += 24;

}
doc.moveDown();

doc
  .font("EnglishBold")
  .text("Address", 50);

doc
  .font("English")
  .text(`: ${patient.address || "-"}`, 150);

  doc.moveDown();

doc
  .font("EnglishBold")
  .fontSize(15)
  .text("Procedure Illustrations");

doc.moveDown();

const selectedImages = illustrations.slice(0, 4);
const positions = [

  { x: 80,  y: doc.y },

  { x: 300, y: doc.y },

  { x: 80,  y: doc.y + 190 },

  { x: 300, y: doc.y + 190 }

];
selectedImages.forEach((img, index) => {

  try {

    const imagePath = path.join(
      __dirname,
      "..",
      "public",
      img.image_url.replace(/^\/+/, "")
    );

    const pos = positions[index];

    doc.image(
      imagePath,
      pos.x,
      pos.y,
      {
        fit: [140,140]
      }
    );

    doc
      .font("English")
      .fontSize(9)
      .text(
        img.caption,
        pos.x,
        pos.y + 140,
        {
          width:140,
          align:"center"
        }
      );
  
  }
  
  
  catch(err){

    console.log(err);

  }

});

    

    

    // ---------------------------------
    // PAGE 2
    // English Consent
    // ---------------------------------
  
    doc.addPage();
    
    doc
      .font("EnglishBold")
      .fontSize(20)
      .text(
        "Consent Document (English)",
        {
          align: "center",
           
        }
      );

    doc.moveDown(2);

   
    doc
      .font("English")
      .fontSize(11)
      .text(
        englishConsent,
        {
          align: "left",
       
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
            align: "center",
             
          }
        );

      doc.moveDown(2);

      
      doc
        .font(regionalFont)
        .fontSize(11)
        .text(
          regionalConsent,
          {
            align: "left",
            
          }
        );

    }
       
// FINAL PAGE
// Consent Confirmation
// ---------------------------------

doc.addPage();

doc
  .font("EnglishBold")
  .fontSize(20)
  .text("CONSENT CONFIRMATION", {
    align: "center",
      width: 495,
      height: 650
  });

doc.moveDown(2);

// =========================
// Patient Signature
// =========================

doc
  .font("EnglishBold")
  .fontSize(12)
  .text("Patient Signature", 50, doc.y);

doc
  .moveTo(50, doc.y + 22)
  .lineTo(230, doc.y + 22)
  .stroke();

doc
  .font("English")
  .fontSize(11)
  .text("Name :", 50, doc.y + 30);

// =========================
// Relative / Witness
// =========================

doc
  .font("EnglishBold")
  .fontSize(12)
  .text("Relative / Witness Signature", 320, 98);

doc
  .moveTo(320, 120)
  .lineTo(520, 120)
  .stroke();

doc
  .font("English")
  .fontSize(11)
  .text("Name :", 320, 128);

doc.text("Relationship :", 320, 148);

// =========================
// Surgeon
// =========================

doc
  .font("EnglishBold")
  .fontSize(12)
  .text("Surgeon Signature", 50, 210);

doc
  .moveTo(50, 232)
  .lineTo(230, 232)
  .stroke();

doc
  .font("English")
  .fontSize(11)
  .text("Date :", 50, 240);

doc.text("Time :", 50, 260);

// =========================
// Hospital Seal
// =========================

doc
  .font("EnglishBold")
  .fontSize(12)
  .text("Hospital Seal", 320, 210);

doc
  .rect(320, 235, 160, 90)
  .stroke();

// =========================
// Disclaimer
// =========================

doc
  .roundedRect(50, 370, 495, 80, 5)
  .fillAndStroke("#F5F5F5", "#CCCCCC");

doc
  .fillColor("black")
  .font("EnglishBold")
  .fontSize(10)
  .text(
    "AI GENERATED DRAFT",
    60,
    385,
    {
      align: "center",
      width: 475
    }
  );

doc
  .font("English")
  .fontSize(9)
  .text(
    "This document is an AI-generated draft intended as an educational and documentation aid. The final informed consent must be reviewed, modified if necessary, and approved by the treating surgeon before clinical use.",
    70,
    405,
    {
      width: 455,
      align: "center"
    }
);

    // ---------------------------------
    // Finish PDF
    // ---------------------------------
    
    const range = doc.bufferedPageRange();

for (let i = 0; i < range.count; i++) {

  doc.switchToPage(i);

  drawFooter(
    doc,
    i + 1,
    range.count
  );

}

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