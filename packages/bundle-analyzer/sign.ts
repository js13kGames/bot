import * as crypto from "crypto";

// generate the private key
// paste that as env var
//
// console.log(
//   `SUCCESS_SIGNATURE_PRIVATE_KEY="${crypto
//     .generateKeyPairSync("rsa", {
//       modulusLength: 4096,
//       publicKeyEncoding: {
//         type: "spki",
//         format: "pem",
//       },
//       privateKeyEncoding: {
//         type: "pkcs8",
//         format: "pem",
//       },
//     })
//     .privateKey.replace(/\n/g, "\\n")}"`
// );

const privateKey = crypto.createPrivateKey(
  process.env.SUCCESS_SIGNATURE_PRIVATE_KEY!
);
const publicKey = crypto.createPublicKey(privateKey);

export const getPrivateKey = () =>
  privateKey.export({
    type: "pkcs8",
    format: "pem",
  });
export const getPublicKey = () =>
  publicKey.export({
    type: "spki",
    format: "pem",
  });

export const sign = (payload: string) => {
  const sign = crypto.createSign("SHA256");
  sign.update(payload);
  sign.end();
  return sign.sign(privateKey).toString("base64");
};

export const verify = (payload: string, signature: string) => {
  const verify = crypto.createVerify("SHA256");
  verify.update(payload);
  verify.end();
  return verify.verify(publicKey, Buffer.from(signature, "base64"));
};
