// src/routes/upload.ts
import express from 'express';
import multer from 'multer';
import cloudinary from '../integrations/cloudinary';
import { Readable } from 'stream';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '未提供檔案' });

    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: 'uploads',
        resource_type: 'auto'
      },
      (err, result) => {
        if (err || !result) return res.status(500).json({ error: '上傳失敗', details: err });

        res.json({
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      }
    );

    Readable.from(req.file.buffer).pipe(stream);
  } catch (error) {
    res.status(500).json({ error: '伺服器錯誤', details: error });
  }
});

export default router;