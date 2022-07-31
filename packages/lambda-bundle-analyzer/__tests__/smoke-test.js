const path = require("path");
const assert = require("assert");

require("dotenv").config({
  path: path.join(__dirname, "../../../.env"),
});

(async () => {
  console.log("--smoke test--");

  const { handle } = require("../../../build/handler");

  assert.equal(typeof handle, "function");

  const res = await handle({
    headers: {
      "content-type":
        "multipart/form-data; boundary=----WebKitFormBoundaryvkfyZHIABzABz3jA",
    },
    body: '------WebKitFormBoundaryvkfyZHIABzABz3jA\r\nContent-Disposition: form-data; name="bundle"; filename="bundle.zip"\r\nContent-Type: application/zip\r\n\r\n\r\n------WebKitFormBoundaryvkfyZHIABzABz3jA\r\nContent-Disposition: form-data; name="category"\r\n\r\nwebxr\r\n------WebKitFormBoundaryvkfyZHIABzABz3jA--\r\n',
  });

  assert.equal(res.statusCode, 200);

  console.log("--smoke test ok--");
})();
