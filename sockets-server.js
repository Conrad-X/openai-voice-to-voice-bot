var express = require("express");
var bodyParser = require("body-parser");
const multer = require("multer");
const OpenAI = require("openai");
const fs = require("fs");
const nocache = require("nocache");
const socket = require("socket.io");
const { pipeline } = require("node:stream/promises");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: `${process.env.OPENAI_API_KEY}`,
});

const DONE = "[DONE]";

var app = express();
app.set("etag", false);
app.use(nocache());
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

app.post("/upload-v2", upload.single("file"), async function (req, res) {
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };
  res.writeHead(200, headers);

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(`public/uploads/${req.file.filename}`),
    model: "whisper-1",
  });

  console.log(`Transcribed ${transcription.text}`);

  if (req.body.lastChunk) {
    console.log("Responding ....");

    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "you are a conversational chatbot, keep it short and keep it precise especially the first sentence. Respond in terms of paragraphs and use commas and full stop where necessary but keep the sentences short as much as possible, avoid bullet point in answers",
        },
        {
          role: "system",
          content:
            "keep your answers precise and short, make sure they are not greater than 50 words, in case of a longer answer, rephrase it and dont give away all the information instead question the user if they need more information",
        },
        { role: "user", content: transcription.text },
      ],
      stream: true,
    });

    let data = "";
    let checkpoint = "";
    counter = false;

    for await (const chunk of stream) {
      const content = chunk.choices[0].delta.content;

      if (content) {
        data += content;
        checkpoint += content;

        if (checkpoint.includes(",") || checkpoint.includes(".")) {
          if (!counter) {
            await speakV2(checkpoint, true);
            counter = true;
          } else {
            await speakV2(checkpoint);
          }

          console.log(`Sending chunk - ${checkpoint}`);
          const eventData = `data: ${JSON.stringify(checkpoint)}\n\n`;
          res.write(eventData);
          checkpoint = "";
        }
      }
    }

    console.log("Chunks Sent!");
    res.end();
  }
});

async function speakV2(data, firstToken, socket) {
  if (data) {
    console.log(`Speaking ... ${data}`);
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: data,
    });

    console.log("Exception: Speaking at speakV2");

    const buffer = Buffer.from(await response.arrayBuffer());
    if (firstToken) {
      await fs.promises.writeFile(`public/uploads/output.mp3`, buffer);
    } else {
      await fs.promises.appendFile(`public/uploads/output.mp3`, buffer);
    }

    socket.emit("audio", buffer);
    console.log("Done!");
  }
}

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
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
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
    console.log("Response Stream Sent.");
  }
});

app.post("/speak", async function (req, res) {
  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: req.body.text,
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.promises.writeFile(`public/uploads/output.mp3`, buffer);
  res.send(true);
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
  res.set("Cache-Control", "no-store");
  res.sendFile(__dirname + "/index.html");
});

const server = app.listen(3000);

async function processTranscription(message, data) {
  const transcription = await createTranscription(data);
  return transcription;
}

async function processResponse() {
  const result = await promises.reduce(async (accumulator, currentPromise) => {
    const results = await accumulator;
    return [...results, await currentPromise];
  }, Promise.resolve([]));

  promises = [];
  generateResponse(result.join(" "), socketConnection);
}

/*  Sockets Layer */
socketConnection = undefined;
let streamEnded = false;
let firstChunkProcessed = false;
let promises = [];
let createNewFile = true;

let data = "";
let checkpoint = "";

io = socket(server);

async function generateResponse(transcribedData, socket) {
  if(!transcribedData) return;
  console.log(`Creating Response for '${transcribedData}'`);

  if (transcribedData) {
    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "you are a conversational chatbot, keep it short and keep it precise especially the first sentence. Respond in terms of paragraphs and use commas and full stop where necessary but keep the sentences short as much as possible, avoid bullet point in answers",
        },
        {
          role: "system",
          content:
            "keep your answers precise and short, make sure they are not greater than 50 words, in case of a longer answer, rephrase it and dont give away all the information instead question the user if they need more information",
        },
        { role: "user", content: transcribedData },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0].delta.content;

      if (content) {
        data += content;
        checkpoint += content;

        if (
          checkpoint.includes(".") ||
          checkpoint.includes("?")
        ) {
          if (!firstChunkProcessed) {
            await speakV2(checkpoint, true, socket);
            firstChunkProcessed = true;
          } else {
            await speakV2(checkpoint, false, socket);
          }

          console.log(`Sending chunk - ${checkpoint}`);
          socket.emit("response", checkpoint);
          checkpoint = "";
        }
      }
    }

    firstChunkProcessed = false;
    socket.emit("response", DONE);
  }
}

async function saveFile(blobData, createNewFile) {
  const blob = new Blob([blobData], {
    type: "audio/wav",
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  if (createNewFile) {
    fs.writeFile("public/uploads/user-socket-input.wav", buffer, () =>
      console.log("Audio Created!")
    );
  }

  if (!createNewFile) {
    fs.appendFile("public/uploads/user-socket-input.wav", buffer, () =>
      console.log("Audio Appended...")
    );
  }

  console.log("Creating Transcription...");
}

async function createTranscription() {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(`public/uploads/user-socket-input.wav`),
      model: "whisper-1",
    });

    if (socketConnection) {
      socketConnection.emit("transcription", transcription.text);
    }

    return transcription.text;
  } catch (ex) {
    console.log("Exception: transcribing at createTranscription");
  }
}

io.on("connection", async (socket) => {
  socketConnection = socket;
  console.log("Socket Connection Established.");

  socket.on("microphone", async function (audioChunk) {
    console.log(`Recieved data chunk ... `);

    if (typeof audioChunk !== "string") {
      await saveFile(audioChunk, createNewFile);
      createNewFile = false;
      promises.push(
        new Promise((resolve, reject) => {
          resolve(processTranscription(audioChunk));
        })
      );
    } else if (audioChunk === DONE) {
      streamEnded = true;
      createNewFile = true;
      await processResponse();
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket Connection Disconnected.");
    streamEnded = false;
  });
});
