import nextConnect from 'next-connect';
import multer from 'multer';
import streamifier from 'streamifier';
import cloudinary from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(multer().single('image'));

apiRoute.post((req, res) => {
  streamifier
    .createReadStream(req.file.buffer)
    .pipe(
      cloudinary.v2.uploader.upload_stream(
        (error, result) => {
          if (result) {
            return res.json({ result });
          } else {
            throw error || "Error uploading image"
          }
        }
      )
    )
});

export default apiRoute;
export const config = {
  api: {
    bodyParser: false
  },
};