exports.createConsentHTML = ({
  patient,
  procedure,
  englishConsent,
  regionalConsent,
  language,
  illustrations = [],
   baseUrl
}) => {

const illustrationHTML =
illustrations
.map(img => `
<div class="illustration">

<img
src="${baseUrl}${img.image_url}"
class="illustration-image"
/>

<div class="caption">
${img.caption}
</div>

</div>
`)
.join("");

return `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<style>

/* ============================= */
/* Fonts */
/* ============================= */

@font-face{
font-family:'English';
src:url('file://${process.cwd()}/fonts/NotoSans-Regular.ttf');
}

@font-face{
font-family:'Gujarati';
src:url('file://${process.cwd()}/fonts/NotoSansGujarati-Regular.ttf');
}

@font-face{
font-family:'Devanagari';
src:url('file://${process.cwd()}/fonts/NotoSansDevanagari-Regular.ttf');
}

@font-face{
font-family:'Tamil';
src:url('file://${process.cwd()}/fonts/NotoSansTamil-Regular.ttf');
}

/* ============================= */

body{

font-family:English;

font-size:14px;

line-height:1.6;

color:#222;

margin:0;

padding:35px;

}

/* ============================= */

h1{

text-align:center;

margin-bottom:5px;

}

h2{

border-bottom:2px solid #1976d2;

padding-bottom:5px;

margin-top:35px;

}

table{

width:100%;

border-collapse:collapse;

margin-top:20px;

}

td{

padding:8px;

border:1px solid #ddd;

}

/* ============================= */

pre{

white-space:pre-wrap;

word-wrap:break-word;

font-size:14px;

line-height:1.7;

}

/* ============================= */

.illustration{

page-break-inside:avoid;

margin-bottom:40px;

text-align:center;

}

.illustration-image{

max-width:450px;

max-height:300px;

}

.caption{

margin-top:10px;

font-weight:bold;

}

/* ============================= */

.signature{

margin-top:60px;

}

.signature-row{

margin-top:35px;

}

.line{

display:inline-block;

width:300px;

border-bottom:1px solid black;

margin-left:20px;

}

/* ============================= */

.gujarati{

font-family:Gujarati;

}

.devanagari{

font-family:Devanagari;

}

.tamil{

font-family:Tamil;

}

.page-break{

page-break-before:always;

}

</style>

</head>

<body>

<h1>SMARTCONSENT SOLUTIONS</h1>

<h3 style="text-align:center;">
AI Assisted Informed Consent
</h3>

<h2>Patient Information</h2>

<table>

<tr>

<td><b>Name</b></td>

<td>${patient.full_name}</td>

</tr>

<tr>

<td><b>Age</b></td>

<td>${patient.age}</td>

</tr>

<tr>

<td><b>Gender</b></td>

<td>${patient.gender || ""}</td>

</tr>

<tr>

<td><b>Diagnosis</b></td>

<td>${patient.diagnosis}</td>

</tr>

<tr>

<td><b>Procedure</b></td>

<td>${procedure.name}</td>

</tr>

<tr>

<td><b>Date</b></td>

<td>${new Date().toLocaleDateString()}</td>

</tr>

</table>

${
illustrations.length>0
?

`

<div class="page-break"></div>

<h2>Procedure Illustrations</h2>

${illustrationHTML}

`

:

""

}

<div class="page-break"></div>

<h2>English Consent</h2>

<pre>

${englishConsent}

</pre>

${
language==="English"

?

""

:

`

<div class="page-break"></div>

<h2>${language} Consent</h2>

<pre class="${
language==="Gujarati"
?"gujarati"
:
language==="Tamil"
?"tamil"
:
"devanagari"
}">

${regionalConsent}

</pre>

`

}

<div class="page-break"></div>

<h2>Signatures</h2>

<div class="signature">

<div class="signature-row">

Patient Signature

<span class="line"></span>

</div>

<div class="signature-row">

Relative Signature

<span class="line"></span>

</div>

<div class="signature-row">

Witness Signature

<span class="line"></span>

</div>

<div class="signature-row">

Surgeon Signature

<span class="line"></span>

</div>

<div class="signature-row">

Date

<span class="line"></span>

</div>

</div>

<hr>

<p style="font-size:11px;color:gray;text-align:center;">

This document is an AI-generated draft prepared for educational and documentation purposes only.
The final informed consent must be reviewed and approved by the treating surgeon before clinical use.

</p>

</body>

</html>

`;

};