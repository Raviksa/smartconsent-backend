
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
      surgicalTechniques,
      patientComplexity,
      perioperativeCare,
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

const techniqueText =
  surgicalTechniques.length > 0
    ? surgicalTechniques.map(t => `- ${t}`).join("\n")
    : "None";

const complexityText =
  patientComplexity.length > 0
    ? patientComplexity.map(c => `- ${c}`).join("\n")
    : "None";

const careText =
  perioperativeCare.length > 0
    ? perioperativeCare.map(c => `- ${c}`).join("\n")
    : "None";
const prompt = `
You are assisting a qualified surgeon in preparing an AI-generated DRAFT informed consent document.

IMPORTANT

This document is ONLY a draft for review by the treating surgeon.

The document must be medically accurate, legally neutral, patient-friendly and easy to understand.

GENERAL RULES

- Use ONLY the information provided below.
- Never invent diagnoses, investigations, findings, medications or allergies.
- Never invent patient-specific risks.
- Never change the procedure name.
- If information is missing, simply omit it.
- Do not make assumptions.
- Do not use markdown.
- Do not use **, *, #, ---, tables or bullet markdown.
- Return plain text only.
- Use numbered headings exactly as requested.
- Keep language simple enough for an average patient and relatives.
- Avoid unnecessary medical jargon.
- Explain medical terms briefly whenever appropriate.

PATIENT INFORMATION

Patient Name:
${patient.full_name}

Age:
${patient.age}

Gender:
${patient.gender || "Not Provided"}

Diagnosis:
${patient.diagnosis}

Proposed Procedure:
${procedure.name}

PATIENT SPECIFIC RISKS

${riskText}

ADDITIONAL INSTRUCTIONS FROM SURGEON

${instructions || "None"}

SURGICAL TECHNIQUE

${techniqueText}

PATIENT COMPLEXITY

${complexityText}

PERIOPERATIVE & POSTOPERATIVE CARE

${careText}

Generate EXACTLY these sections in this order.

1. Patient Information

Include:
- Patient Name
- Age
- Gender
- Diagnosis
- Proposed Procedure

2. Introduction

Explain why this consent document is being provided.

3. Disease Explanation

Explain the disease in simple language.

If any Surgical Technique has been selected (for example Robotic Assisted Surgery, Minimally Invasive Surgery or Navigation Assisted Surgery), briefly explain how that technique relates to this procedure whenever appropriate.

4. Purpose of Surgery

Explain why the surgery is recommended.

If a Surgical Technique has been selected, explain why that technique has been chosen and its intended advantages in simple language.

5. Expected Benefits

Mention realistic expected benefits.

Do not promise cure.

If Robotic Assisted Surgery, Navigation Assisted Surgery or Minimally Invasive Surgery has been selected, include their expected benefits only when appropriate.

6. Alternatives to Surgery

Mention reasonable non-surgical and surgical alternatives whenever generally applicable.

7. Risks and Complications

7.1 General Surgical Risks

Mention common risks applicable to most surgical procedures.


Mention the possibility of blood transfusion ONLY if
"Blood Transfusion May Be Required"
has been selected.

Otherwise, simply mention bleeding as a general surgical risk without referring to transfusion.

7.2 Procedure-Specific Risks

Mention risks specific to the selected procedure.

If Surgical Technique selections introduce additional considerations, explain them naturally.

7.3 Patient-Specific Risks

Only include patient-specific risks if explicitly provided.

If Patient Complexity factors have been selected (for example High Risk Patient, Severe Deformity, Bone Loss, Infection, Morbid Obesity, Osteoporosis or Previous Surgery), explain how they may influence surgery, recovery or complication risk.

If Perioperative Care selections such as Blood Transfusion, Drain, Tissue Biopsy or ICU Observation have been selected, include them only where appropriate.

8. Recovery and Rehabilitation

Describe:

- Expected hospital stay
- Pain management
- Physiotherapy (if selected or routinely required)
- Walking and mobility
- Walking aids such as walker or crutches (if selected)
- Weight-bearing instructions when appropriate
- Expected recovery period
- Follow-up visits when appropriate

If ICU Observation has been selected:

- Mention it ONLY ONCE.
- Include it under Recovery and Rehabilitation.
- Do not repeat it under Patient-Specific Risks unless ICU admission itself is a direct patient-specific risk.

9. Patient Declaration

State that the patient confirms:

- the information was explained
- questions were answered
- risks were understood
- alternatives were discussed
- consent is voluntary
- consent may be withdrawn before surgery

10. Surgeon Certification

State that:

- the procedure was explained
- risks and alternatives were explained
- patient questions were answered
- explanation was given in understandable language

11. AI Draft Disclaimer

Write EXACTLY the following paragraph.

This document is an AI-generated draft prepared as an educational and documentation aid. The final informed consent must be reviewed, modified if necessary, and approved by the treating surgeon before clinical use.

IMPORTANT INSTRUCTIONS

- Use the selected Surgical Technique, Patient Complexity and Perioperative & Postoperative Care throughout the document where relevant.
- Integrate these selections naturally into the appropriate sections.
- Do NOT create separate headings for these selections.
- Do NOT simply list the selected options.
- Mention only options that were selected.
- Never mention options that were not selected.
- Never invent information that was not provided.

STYLE REQUIREMENTS

- Plain text only.
- No markdown.
- No ** characters.
- No bullet markdown.
- No introductory sentences.
- No concluding remarks.
- Do not write "Here is your consent".
- Start directly with section 1.
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

RULES

- Translate the ENTIRE document.
- Preserve every heading.
- Preserve every paragraph.
- Preserve every declaration.
- Preserve the disclaimer.
- Do not summarize.
- Do not omit information.
- Do not add information.
- Do not explain the translation.
- Do not add introductory sentences.
- Do not add concluding sentences.
- Return ONLY the translated consent.
- Keep the numbering exactly the same.
- Use natural ${language} suitable for patients and relatives.
- Mention the English medical term only once when it first appears.
- Afterwards use the regional language term.

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
