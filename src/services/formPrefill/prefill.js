/**
 * prefill the form with params read from the querystring
 * trivial for text input
 * but hacky for files
 *   file input can not be modified from the js
 *   the workaround is to hijack the submit event of the form, and forge a formData with the custom files
 */
{
  /**
   * polyfill
   */
  const ObjectFromEntries = iterable =>
    Object.assign({}, ...[...iterable].map(([key, val]) => ({ [key]: val })));

  /**
   * read querystring
   */
  const readQueryString = () =>
    ObjectFromEntries(
      window.location.search
        .slice(1)
        .split("&")
        .map(s => s.split("=").map(decodeURIComponent))
    );

  const query = readQueryString();

  /**
   * prefill the input text with params read from the queryparams,
   * for input file, load the url as binary
   */
  const files = {};
  [
    //
    "description",
    "categories[]",
    "author",
    "twitter",
    "website_url",
    "github_url",
    "title",
    "file",
    "small_screenshot",
    "big_screenshot"
  ].forEach(async name => {
    if (!query[name]) return;

    const el =
      document.querySelector(`input[name="${name}"]`) ||
      document.querySelector(`textarea[name="${name}"]`);

    if (el.tagName === "TEXTAREA") el.innerText = query[name];

    // special case for categories checkbox
    {
      [...document.querySelectorAll(`[name="categories[]"]`)].forEach(el => {
        el.checked = query["categories[]"].includes(el.value);
      });
    }

    switch (el.type) {
      case "text":
      case "number":
      case "email":
        el.value = query[name];
        break;

      case "file":
        try {
          const el = document.querySelector(`input[name="${name}"]`);
          el.style.boxShadow = "0 0 1px 1px grey";

          files[name] = "loading";
          files[name] = await fetch(query[name])
            .then(res => res.blob())
            .catch(error => {
              alert("failed to load the file into the form");
              console.error(error);
            });

          if (files[name]) {
            el.style.boxShadow = "0 0 1px 1px green";
            el.required = false;

            const tooltip = document.createElement("div");
            tooltip.style.backgroundColor = "#cccccc";
            tooltip.style.position = "relative";
            tooltip.style.display = "inline-block";
            tooltip.style.padding = "4px";
            tooltip.style.borderRadius = "4px";
            tooltip.style.top = "-6px";
            tooltip.style.left = "10px";

            tooltip.innerHTML = `👍 successfully loaded from pull request, <a href="${query[name]}">${name}</a>`;
            el.parentNode.appendChild(tooltip);

            el.addEventListener("change", () => {
              el.parentNode.removeChild(tooltip);
            });
          }
        } catch (err) {
          console.error(err);
        }
    }
  });

  /**
   * hijack the submit event
   * send a forged request, including the files read from url
   * ( if any file is found in the queryparams, else fallback to basic from post )
   */
  {
    const el = document.querySelector('[action="/submit"]');
    el.addEventListener("submit", async event => {
      const fd = new FormData();
      let customFile = false;

      [...event.target.elements].forEach(el => {
        const name = el.name;

        if (el.tagName === "TEXTAREA") fd.set(name, el.value);

        switch (el.type) {
          case "text":
          case "number":
          case "email":
            fd.set(name, el.value);
            break;

          case "file":
            if (el.value) {
              fd.set(name, el.value);
            } else if (files[name] === "loading") {
              alert("loading the file into the form ... please retry");
              throw new Error("file loading");
            } else if (files[name]) {
              customFile = true;
              fd.set(
                name,
                new File([files[name]], name, { type: files[name].type })
              );
            }
        }
      });

      // special case for categories checkbox
      {
        [...document.querySelectorAll(`[name="categories[]"]`)]
          .filter(el => el.checked)
          .forEach(el => {
            fd.append("categories[]", el.value);
          });
      }

      // fallback to classic form if no need to inject file
      if (!customFile) return;

      event.preventDefault();

      fd.set("delivery", "bot");

      await fetch(window.location.origin + "/submit", {
        method: "post",
        body: fd
      })
        .then(res => res.text())
        .then(res => {
          document.body.innerHTML = res;
        });
    });
  }
}
