const formElement = document.querySelector('form[action="/submit"]');

const deliveryInput = formElement.querySelector('input[name="delivery"]');

const categoryInputs = Array.from(
  formElement.querySelectorAll('input[name="categories[]"]')
);
const bundleInput = formElement.querySelector('input[name="file"]');

const bundleInputHint = document.createElement("div");
bundleInput.parentElement.insertBefore(
  bundleInputHint,
  bundleInput.nextSibling
);
bundleInputHint.style.backgroundColor = "#eee";
bundleInputHint.style.padding = "10px";
bundleInputHint.style.margin = "10px auto";
bundleInputHint.style.textAlign = "left";
bundleInputHint.style.width = "fit-content";
bundleInputHint.style.maxWidth = "600px";
bundleInputHint.style.minWidth = "480px";
bundleInputHint.style.borderRadius = "2px";

// hold the current request ( useful to detect pending request, and abort it )
let request;

// hold the current result, as given by the endpoint
let result = null;

// on submit, display a confirm if some test were failing
// the user get a chance to either confirm and continue with this submission
// or cancel and submit a fix
let confirmMessage = null;
formElement.addEventListener("submit", (event) => {
  if (confirmMessage && !window.confirm(confirmMessage)) event.preventDefault();
});

// called for every change of the input or categories inputs
const onChange = () => {
  // aborting previous
  if (request) request.abort();
  result = null;
  request = null;

  // ignore if there is no categories, or no file
  if (!bundleInput.files[0] || !categoryInputs.some((i) => i.checked)) {
    updateUi();
    return;
  }

  // create the form data
  const categoryMap = {
    22: "desktop",
    23: "mobile",
    24: "server",
    25: "webmonetization",
    26: "webxr",
  };
  const fd = new FormData();
  fd.append("bundle", bundleInput.files[0]);
  categoryInputs
    .filter((i) => i.checked)
    .forEach((i) => fd.append("category", categoryMap[i.value]));

  // send request
  request = new XMLHttpRequest();
  request.addEventListener("readystatechange", (e) => {
    if (request.readyState == 4) {
      bundleInputHint.innerHTML = "";

      try {
        result = JSON.parse(request.responseText);
      } catch (err) {
        result = err;
        console.error(err);
      }

      request = null;
      updateUi();
    }
  });
  request.open(
    "POST",
    "https://iw8sii1h9b.execute-api.eu-west-1.amazonaws.com/stage/analyze-bundle"
  );
  request.send(fd);

  updateUi();
};
bundleInput.addEventListener("change", onChange);
categoryInputs.forEach((i) => i.addEventListener("change", onChange));

// based on the global variables result and request,
// update the ui
// - the hint panel
// - the delivery hidden input
// - the confirm message
const updateUi = () => {
  if (result && !(result instanceof Error)) {
    //
    // we got a result

    bundleInputHint.style.display = "block";
    bundleInputHint.innerHTML = result.checks
      .map((c) => {
        switch (c.result) {
          case "ok":
            return "✔️ " + c.description;

          case "untested":
            return "🔶 " + c.description;

          case "failed":
            return (
              "❌ " +
              c.description +
              '<br/><pre style="font-size:0.8em;margin-left:12px;overflow:auto">' +
              (c.details || "") +
              "</pre>"
            );
        }
      })
      .map(
        (content) =>
          '<li style="list-style:none;margin-bottom:10px" >' + content + "</li>"
      )
      .join("");

    if (!result.checks.length)
      bundleInputHint.innerHTML =
        "no automated rules applies for this category";

    deliveryInput.value = result.checks.every((c) => c.result === "ok")
      ? "bot"
      : "form";

    confirmMessage =
      result.checks.some((c) => c.result !== "ok") &&
      [
        "Your submission did not pass the automated test.",
        "",
        result.checks
          .filter((c) => c.result === "failed")
          .map((c) => " - " + c.description)
          .join("\n"),
        "",
        "Are you sure you want to force the submission anyway?",
      ].join("\n");
  } else if (request && !result) {
    //
    // we don't have a result yet and there is a request pending

    bundleInputHint.style.display = "block";
    bundleInputHint.innerHTML = "analyzing bundle...";

    deliveryInput.value = "form";

    confirmMessage =
      "Our bot have not finished to evaluate your submission.\n\nAre you sure you want to force the submission without waiting for validation?";
  } else if (result instanceof Error) {
    //
    // the result is an unexpected error

    bundleInputHint.style.display = "block";
    bundleInputHint.innerHTML =
      "our bot is temporary unavailable, sorry about that";

    deliveryInput.value = "form";

    confirmMessage =
      "Our bot was temporary unable to validate your submission.\n\nAre you sure you want to force the submission anyway?";
  } else {
    //
    // no result, typically when there is no bundle

    bundleInputHint.style.display = "none";
    bundleInputHint.innerHTML = "";

    deliveryInput.value = "form";

    confirmMessage = null;
  }
};
updateUi();
