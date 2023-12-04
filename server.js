var express = require("express");
var bodyParser = require("body-parser");
const multer = require("multer");
const OpenAI = require("openai");
const fs = require("fs");
const { pipeline } = require("node:stream/promises");

const openai = new OpenAI({
  apiKey: "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",
});

var app = express();
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    // 1. To update filename cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
    cb(null, `user-input.${ext}`);
  },
});

const upload = multer({
  storage: multerStorage,
});

app.post("/upload", upload.single("file"), async function (req, res) {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(`public/uploads/${req.file.filename}`),
    model: "whisper-1",
  });
  
  console.log(`Transcribed ${transcription.text}`);

  if (req.body.lastChunk) {
    console.log("Responding ....");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer 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`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `${transcription.text}`,
          },
        ],
        stream: true,
      }),
    });

    await pipeline(response.body, res);


    // const mp3 = await openai.audio.speech.create({
    //   model: "tts-1",
    //   voice: "alloy",
    //   input: "Today is a wonderful day to build something people love!",
    // });
    // console.log(speechFile);
    // const buffer = Buffer.from(await mp3.arrayBuffer());
  }
});

app.post("/respond", async function (req, res) {
  console.log("Responding ....");
  console.log(req.body.text);

  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: req.body.text }],
    stream: true,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.listen(3000);
