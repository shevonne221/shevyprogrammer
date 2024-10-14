const PORT = process.env.PORT || 8000;
const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const multer = require("multer");
const axios = require('axios');

// Adding multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to our server hello there ");
});

app.post("/save/single", upload.single("file"), (req, res) => {
  res.json({ message: "File uploaded" });
});

app.post("/save/multiple", upload.array("files", 100), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No files uploaded.");
  }
  const filePaths = req.files.map((file) => file.path);
  res.json({ message: `Files uploaded successfully: ${filePaths.join(", ")}` });
});

app.post('/upload', upload.single('file'), (req, res) => {
  console.log(req.file); // Check if file data is coming through
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.json({ message: "Dog image uploaded successfully!" });
});


app.get("/fetch/single", (req, res) => {
  let files_array = fs.readdirSync(path.join(__dirname, "uploads"));
  if (files_array.length === 0) {
    return res.status(503).send({ message: "No images" });
  }
  let filename = _.sample(files_array);
  console.log("Serving single file:", filename); // Log the file being served
  res.sendFile(path.join(__dirname, "uploads", filename));
});


app.get('/fetch/multiple', (req, res) => {
  const files = fs.readdirSync(path.join(__dirname, "uploads")).map(file => path.join(__dirname, "uploads", file));
  console.log("Serving multiple files:", files); // Log the files being served
  res.json({ files });
});


// Random Dog Image Route
app.get('/dog/random', async (req, res) => {
  try {
    const response = await axios.get('https://dog.ceo/api/breeds/image/random');
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching dog image:", error);
    res.status(500).send("Error fetching dog image");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

app.use("", (req, res) => {
  res.status(404).send("Page not found");
});
