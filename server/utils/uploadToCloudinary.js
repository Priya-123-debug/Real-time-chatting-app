import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";


const uploadToCloudinary = (file) => {

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "talkie-chat",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.dir(error, { depth: null });
          console.log("Response:", error.response);
          return reject(error);
        }

        resolve(result);
      },
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

export default uploadToCloudinary;
