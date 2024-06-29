const mongoose = require("mongoose");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("./user.shema");

const app = express();

app.use(express.json());

// Убедитесь, что папка 'uploads' существует
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // сохранение файла с уникальным именем
  },
});

// Настройка загрузки файла
const upload = multer({ storage: storage });

// Маршрут для загрузки файла
app.post("/api/uploads", upload.array("images", 10), (req, res) => {
  try {
    const fileNames = req.files.map((file) => file.filename);
    res.json([fileNames]);
  } catch (err) {
    res.sendStatus(400);
  }
});

app.post("/api/user", async (req, res) => {
  const user = new User({ ...req.body, avatar: req.body.images[0] });
  await user.save();
  res.send("Пользотель создан");
});

app.get("/api/user", async (req, res) => {
  const user = await User.find();
  res.json(user);
});

app.put("/api/user/:id", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { ...req.body, avatar: req.body.images[0] });
  res.send("Обновленно");
});

app.delete("/api/user/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.send(true);
});
// публичный
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
// Запуск сервера

const start = async () => {
  await mongoose
    .connect("mongodb+srv://mrtebron:NDzgh3ZICjaSQ5tw@u-future.ytivbts.mongodb.net/?retryWrites=true&w=majority&appName=U-Future", {})
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err));

  await app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
};
start();
