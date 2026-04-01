const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();

const { OpenAI } = require("openai");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const originalExt = path.extname(file.originalname || "").toLowerCase() || ".m4a";
    const fileName = `${Date.now()}-${crypto.randomUUID()}${originalExt}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.json({ message: "Clarity Care API is running" });
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
  });
});

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  let filePath = null;

  try {
    console.log("---- /transcribe hit ----");

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    console.log("Uploaded file info:", req.file);

    filePath = req.file.path;
    console.log("Saved file path:", filePath);

    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "gpt-4o-mini-transcribe",
    });

    const transcriptText = transcription.text || "";

    if (!transcriptText.trim()) {
      return res.status(500).json({
        error: "Transcription returned empty text",
      });
    }

    const prompt = `
You are helping generate visit summaries for a patient-facing medical demo app.

Return ONLY valid JSON.
Do not use markdown fences.
Do not include extra commentary.

Use exactly this shape:
{
  "simple": "...",
  "standard": "...",
  "clinical": "..."
}

Rules:
- simple: very plain language for a patient
- standard: concise neutral summary
- clinical: more medical wording
- keep each summary short and readable

Transcript:
${transcriptText}
`;

    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const rawText = (completion.output_text || "").trim();

    let summaries;
    try {
      summaries = JSON.parse(rawText);
    } catch (err) {
      summaries = {
        simple: rawText,
        standard: rawText,
        clinical: rawText,
      };
    }

    return res.json({
      transcript: transcriptText,
      summaries,
    });
  } catch (error) {
    console.error("TRANSCRIBE ERROR:", error);
    return res.status(500).json({
      error: error?.message || "Failed to transcribe and summarize audio",
    });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});