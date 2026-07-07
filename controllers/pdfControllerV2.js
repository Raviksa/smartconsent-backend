const puppeteer = require("puppeteer");
const fs = require("fs");
const pool = require("../config/db");
const {
  createConsentHTML
} = require("../templates/consentTemplate");

exports.generatePdf = async (req, res) => {

  let browser;

  try {

    const {
      patient,
      procedure,
      consent,
      illustrations,
      language
    } = req.body;


    // -----------------------------
    // Save Consent
    // -----------------------------

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

    // -----------------------------
    // Clean markdown
    // -----------------------------

    const cleanConsent = consent
      .replace(/\*\*/g, "")
      .replace(/^\*\s/gm, "• ")
      .replace(/\\_/g, "_");

    // -----------------------------
    // Split English / Translation
    // -----------------------------

    let englishConsent = cleanConsent;
    let regionalConsent = "";

    if (language !== "English") {

      const parts =
        cleanConsent.split(
          "========================"
        );

      if (parts.length >= 5) {

        englishConsent =
          parts[2].trim();

        regionalConsent =
          parts[4].trim();

      }

    }
const html = createConsentHTML({

    patient,

    procedure,

    englishConsent,

    regionalConsent,

    language,

    illustrations,

    baseUrl: process.env.BASE_URL

});
    // -----------------------------
    // Create HTML
    // -----------------------------

   
    // -----------------------------
    // Launch Browser
    // -----------------------------

   console.log("Resolved executable:", puppeteer.executablePath());
console.log("================================");
console.log("Puppeteer executable:", puppeteer.executablePath());

console.log(
  "Chrome exists:",
  fs.existsSync("/usr/bin/google-chrome-stable")
);

console.log(
  "Chromium exists:",
  fs.existsSync("/usr/bin/chromium")
);

console.log(
  "Chromium-browser exists:",
  fs.existsSync("/usr/bin/chromium-browser")
);

console.log("================================");
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome-stable",
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage"
  ]
});
    const page =
      await browser.newPage();

    await page.setContent(
      html,
      {
        waitUntil:
          "networkidle0"
      }
    );

    // -----------------------------
    // Generate PDF
    // -----------------------------
    console.log(
  "Chrome path:",
  process.env.PUPPETEER_EXECUTABLE_PATH
);
    const pdf =
      await page.pdf({

        format: "A4",

        printBackground: true,

        margin: {

          top: "20mm",

          bottom: "20mm",

          left: "18mm",

          right: "18mm"

        }

      });

    await browser.close();

    res.set({

      "Content-Type":
        "application/pdf",

      "Content-Disposition":
        "attachment; filename=Consent.pdf"

    });

    res.send(pdf);

  }

  catch (err) {

    console.error(err);

    if (browser)
      await browser.close();

    if (!res.headersSent) {

      res.status(500).json({

        message: "PDF Error"

      });

    }

  }

};