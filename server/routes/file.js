import express from "express";
import mongoose from "mongoose";

import { GridFsStorage } from "multer-gridfs-storage";
import crypto from "crypto";
import path from "path";


import multer from "multer";

const router = express.Router();

export const storage = new GridFsStorage({
  url: process.env.MONGO_CONNECTION_STRING,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);

        //validate upload by attribute
        if (!req.body.uploadBy || !file || file.length === 0) return reject(new Error("uploadBy attribute is required"))
        return resolve({
          filename: buf.toString("hex") + path.extname(file.originalname), // modify the file name using random hex string inorger to prevent file duplicate
          bucketName: "files", // Name of the MongoDB collection,
          //add the uploadBy and orginalname field as metadata
          metadata: {
            uploadBy: req.body.uploadBy,
            originalname: file.originalname
            // You can add other metadata fields here
          }
        });
      });
    });
  },
});



router.get("/files", async (req, res) => {
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "files",
    });

    const files = await bucket.find({}).toArray();
    res.status(200).json({ success: true, count: files.length, files });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to retirive file infos." });
  }
})




router.get("/file/:filename", async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename)
      return res
        .status(404)
        .json({ success: false, msg: "file name is required" });

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "files",
    });

    const file = await bucket.find({ filename }).toArray();
    if (file.length == 0)
      return res
        .status(404)
        .json({ success: false, msg: `No file with : '${filename}' exist.` });
    res.status(200).json({ success: true, file });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to retirive file info." });
  }
})

router.delete("/file/:filename", async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "Filename is required for deleting a file.",
      });
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "files",
    });

    const file = await bucket.find({ filename }).toArray();
    if (file.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No file with the filename '${filename}' exists.`,
      });
    }

    const fileId = file[0]._id;

    await bucket.delete(fileId);

    res.status(200).json({
      success: true,
      message: `File with the filename '${filename}' has been deleted.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete the file.",
    });
  }
});



// router.get("/stream/:filename", async (req, res) => {
//   try {
//     const { filename } = req.params;

//     if (!filename)
//       return res
//         .status(404)
//         .json({ success: false, msg: "file name is required" });

//     const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
//       bucketName: "files",
//     });

//     const downloadStream = bucket.openDownloadStreamByName(filename);

//     let data = "";

//     downloadStream.on("data", (chunk) => {
//       data += chunk.toString("base64");
//     });

//     downloadStream.on("end", () => {
//       res.render("index", { imageData: data, ok: true });
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, msg: "Internal server error" });
//   }
// });

router.get("/stream/:filename", async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename)
      return res
        .status(404)
        .json({ success: false, msg: "File name is required" });

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "files",
    });

    const downloadStream = bucket.openDownloadStreamByName(filename);

    downloadStream.pipe(res); // Stream the image data directly to the response

    downloadStream.on("error", (error) => {
      res.status(500).json({ success: false, msg: "Internal server error" });
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
});

router.get("/streams", async (req, res) => {
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "files",
    });

    const imageNames = await bucket.find().toArray();
    console.log(imageNames);

    const imageDataPromises = imageNames.map((image) => {
      const filename = image.filename;

      const downloadStream = bucket.openDownloadStreamByName(filename);

      let data = "";

      downloadStream.on("data", (chunk) => {
        data += chunk.toString("base64");
      });

      const streamEndPromise = new Promise((resolve) => {
        downloadStream.on("end", () => {
          resolve(data);
        });
      });

      return streamEndPromise;
    });

    const imageData = await Promise.all(imageDataPromises);

    res.render("index", { imageData: imageData, ok: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
});

router.get("*", (req, res) => {
  res.redirect("/streams")
})

const upload = multer({ storage });

router.post("/upload", upload.array("files", 3), async (req, res) => {
  res.redirect("/streams")
}
);

export { router as fileRouter };
