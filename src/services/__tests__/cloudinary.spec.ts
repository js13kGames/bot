import fs from "fs";
import path from "path";
import { uploadImage } from "../cloudinary";

describe("cloudinary", () => {
  it("should upload an image as buffer", async () => {
    const image = fs.readFileSync(path.join(__dirname, "image-sample.jpeg"));

    const url = await uploadImage(image);

    expect(typeof url).toBe("string");
  });
});
