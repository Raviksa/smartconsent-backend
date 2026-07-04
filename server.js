require("dotenv").config();
const procedureIllustrationRoutes =
require(
"./routes/procedureIllustrationRoutes"
);
const express = require("express");
const cors = require("cors");



const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const procedureRoutes =
require(
"./routes/procedureRoutes"
);
const patientRoutes =
require(
"./routes/patientRoutes"
);
const aiRoutes =
require(
  "./routes/aiRoutes"
);
const pdfRoutes =
require(
  "./routes/pdfRoutes"
);
// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use(
"/api/patients",
patientRoutes
);
app.use(
  "/api/procedure-illustrations",
  procedureIllustrationRoutes
);
app.use(
  "/api/ai",
  aiRoutes
);
app.use(
  "/api/pdf",
  pdfRoutes
);

// Test Route
app.get("/", (req, res) => {
  res.send("SmartConsent Backend Running");
});

// Database Connection Test
// Database Connection Test
pool.query("SELECT NOW()")
  .then(() => {
    console.log(
      "✅ PostgreSQL Connected"
    );
  })
  .catch((err) => {
    console.log(
      "❌ Database Error"
    );
    console.log(err);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
app.use(
  "/api/procedures",
  procedureRoutes
);