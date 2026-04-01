const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const { OpenAI } = require("openai");

const app = express();
const port = process.env.PORT || 4000;
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
    res.json({ message: "Clarity Care API is running" });
});

app.get("/health", (req, res) => {
    res.json({ ok: true });
});

app.post("/mock-summary", async (req, res) => {
    res.json({
        transcript:
            "Patient discussed headaches for the past three days and asked whether they should continue taking ibuprofen.",
        summaries: {
            simple:
                "You talked about having headaches for three days. You also asked if it is okay to keep taking ibuprofen.",
            standard:
                "The patient reported headaches lasting three days and asked about continued ibuprofen use.",
            clinical:
                "Patient reports 3-day history of headache and requests guidance regarding ongoing ibuprofen use."
        }
    });
});

app.post("/transcribe", upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No audio file uploaded" });
        }

        const filePath = path.resolve(req.file.path);

        const transcription = await client.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "gpt-4o-mini-transcribe"
        });

        const transcriptText = transcription.text;

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
            input: prompt
        });

        const rawText = completion.output_text.trim();

let summaries;
try {
    summaries = JSON.parse(rawText);
} catch (error) {
    console.error("Failed to parse model output as JSON:", rawText);
    summaries = {
        simple: rawText,
        standard: rawText,
        clinical: rawText
    };
}

        fs.unlinkSync(filePath);

        res.json({
            transcript: transcriptText,
            summaries
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to transcribe and summarize audio" });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});