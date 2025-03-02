import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import createBucket, { bucketName } from "../media/bucket/bucket.js";
import { upload } from "../multer/multer.js";
import { createMiniMedia, getFileUrl } from "../media/crud-minio/crud.js";
import minioClient from "../media/cloud.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

app.get("/", async (req, res, next) => {
  fs.readFile(
    path.join(__dirname, "public/index.html"),
    "utf-8",
    (err, data) => {
      if (err) {
        console.log(err);
      }

      res.send(data);
    }
  );
});

app.post("/upload", upload.single("file"), async (req, res, next) => {
  const file = req.file;

  if (!file) {
    console.log("File is not defined");
  }

  const objectName = file.originalname;

  try {
    await createMiniMedia(file.path, objectName);
    res.json(`Fayl muvaffaqqiyatli yuklandi ${objectName}`);
  } catch (error) {
    console.log(error);
  }
});

app.get("/get-url", async (req, res, next) => {
  try {
    const { url } = await getFileUrl();

    res.json(url);
  } catch (error) {
    console.log(url);
  }
});

app.get("/everyfile", async (req, res) => {
    try {
      const media = [];
      const stream = minioClient.listObjects(bucketName, "", true);
  
      const objects = [];
  
      // Fayllarni yig‘ib boramiz
      stream.on("data", (data) => {
        objects.push(data.name);
      });
  
      stream.on("error", (err) => {
        console.error(err);
        return res.status(500).json({ error: err.message });
      });
  
      stream.on("end", async () => {
        try {
          // Barcha fayllar uchun URL yaratamiz
          const urls = await Promise.all(
            objects.map(async (fileName) => {
              const url = await minioClient.presignedGetObject(bucketName, fileName, 24 * 60 * 60);
              return { url };
            })
          );
  
          res.json(urls);
        } catch (err) {
          console.error("URL yaratishda xatolik:", err);
          res.status(500).json({ error: "URL yaratishda xatolik" });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server xatosi" });
    }
  });
  

createBucket();

app.listen(5000);
