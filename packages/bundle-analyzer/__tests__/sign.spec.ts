import { getPrivateKey, getPublicKey, sign, verify } from "../sign";

it("should expose private and public key", () => {
  expect(getPrivateKey()).toBeDefined();
  expect(getPublicKey()).toBeDefined();

  console.log(getPublicKey());
});

it("should sign and verify", () => {
  const payload = "hello";
  const signature = sign(payload);

  expect(verify(payload, signature)).toBe(true);
  expect(verify(payload + "00", signature)).toBe(false);
});
