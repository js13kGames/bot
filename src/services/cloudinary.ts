import cloudinary from "cloudinary";
import path from "path";
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

  const filename = trimExtension(url.split("/").slice(-1)[0]);

  return cloudinary.v2
    .url(filename, { format: "jpg", ...options })
    .replace("http://", "https://");
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

const trimExtension = filename => {
  const ext = path.extname(filename);
  return filename.slice(0, -ext.length);
};
