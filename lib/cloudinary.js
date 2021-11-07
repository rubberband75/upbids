import cloudinary from "cloudinary"
import streamifier from "streamifier"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadCoudinaryImage = async (file) => {
  return new Promise((resolve, reject) => {
    streamifier.createReadStream(file.buffer).pipe(
      cloudinary.v2.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result)
        } else {
          reject(error)
        }
      })
    )
  })
}

export default uploadCoudinaryImage
