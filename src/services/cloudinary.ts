import cloudinary from "cloudinary";
import * as config from "../config";
import { getHash } from "./md5";

export const createUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    crop?: "fill" | "limit" | "fit" | "scale";
    format?: "jpg" | "png";
  } = {}
) => {
  cloudinary.v2.config(config.cloudinary);

  const filename = url.split("/").slice(-1)[0];

  return cloudinary.v2.url(filename, options);
};

export const uploadImage = async (image: Buffer): Promise<string> =>
  new Promise((resolve, reject) => {
    cloudinary.v2.config(config.cloudinary);

    const stream = cloudinary.v2.uploader.upload_stream(
      { public_id: getHash(image) },
      (err, res) => (err ? reject(err) : resolve(res.secure_url))
    );

    stream.write(image);
    stream.end();
  });
