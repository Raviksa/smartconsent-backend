
require("dotenv").config();
const {
  GoogleGenerativeAI
} = require(
  "@google/generative-ai"
);

const genAI =
new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

exports.generateConsent =
async (req, res) => {
 console.log(
    "🔥 AI CONTROLLER HIT"
  );

  try {

    const {
      patient,
      procedure,
      risks,
      instructions,
      language
    } = req.body;

    const model =
      genAI.getGenerativeModel({
       model: "gemini-2.5-flash"
      });
const riskText =
  risks.length > 0
    ? risks.map(r => `- ${r}`).join("\n")
    : "None specified";

const prompt = `
You are assisting a surgeon in creating a DRAFT informed consent document for patient education.



IMPORTANT RULES:
- Use ONLY the information provided below.
- DO NOT make assumptions about the diagnosis, severity, investigations, or patient condition.
- DO NOT invent additional diseases, comorbidities, medications, allergies, or risks.
- Mention patient-specific risks ONLY if they are explicitly provided.
- If information is missing, do not create or infer it.
- Write in clear, professional, patient-friendly medical language.
- This is an AI-generated draft that will be reviewed and edited by the treating surgeon.

PATIENT INFORMATION
-------------------
Patient Name: ${patient.full_name}
Age: ${patient.age}
Gender: ${patient.gender || "Not Provided"}
Diagnosis: ${patient.diagnosis}
Procedure: ${procedure.name}

PATIENT-SPECIFIC RISKS
----------------------
Patient Specific Risks:
${riskText}

ADDITIONAL INSTRUCTIONS FROM SURGEON
------------------------------------
${instructions || "None"}

Generate the following sections:

1. Patient Information
2. Introduction
3. Disease Explanation
4. Purpose of Surgery
5. Expected Benefits
6. Alternatives to Surgery
7. Risks and Complications
   - General Risks
   - Procedure-Specific Risks
   - Patient-Specific Risks (only if explicitly provided)
8. Recovery and Rehabilitation
9. Patient Declaration
10. Surgeon Certification

At the end add the following statement:

"This document is an AI-generated draft prepared as an educational and documentation aid. The final informed consent must be reviewed, modified if necessary, and approved by the treating surgeon before use."

`;
console.log("====== LANGUAGE ======");
console.log(language);

console.log("====== PROMPT ======");
console.log(prompt);
console.log("Selected language:", language);
const englishResult =
  await model.generateContent(
    prompt
  );

const englishConsent =
  englishResult.response.text();

let finalConsent =
  englishConsent;

// Translate if required

if (language !== "English") {
console.log("✅ Translation block entered");
  const translationPrompt = `
Translate the following informed consent into ${language}.

Requirements:

- Translate the ENTIRE document.
- Preserve every heading.
- Preserve every paragraph.
- Preserve every declaration.
- Preserve the AI disclaimer.
- Do NOT summarize.
- Do NOT add new information.
- Do NOT remove information.
- Use simple language understandable by patients.

Document:

${englishConsent}
`;

  const translationResult =
    await model.generateContent(
      translationPrompt
    );

  const translatedConsent =
    translationResult.response.text();

  finalConsent =

`========================
ENGLISH VERSION
========================

${englishConsent}

========================
${language.toUpperCase()} VERSION
========================

${translatedConsent}`;

}

res.json({
  consent: finalConsent
});
} catch (err) {

  console.log(err);

  res.status(500).json({
    message: "AI Error"
  });
}
};
