import crypto from "crypto";

export const getHash = (data: crypto.BinaryLike) =>
  crypto
    .createHash("md5")
    .update(data)
    .digest("hex");
