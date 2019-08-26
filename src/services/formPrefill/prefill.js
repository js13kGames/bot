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

          files[name] = await fetch(query[name]).then(res => res.blob());

          el.style.boxShadow = "0 0 1px 1px green";
          el.required = false;
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

        if (el.tagName === "TEXTAREA") fd.append(name, el.innerText);

        switch (el.type) {
          case "text":
          case "number":
          case "email":
            fd.append(name, el.value);
            break;

          case "file":
            if (el.value) fd.append(name, el.value);
            else if (files[name]) {
              customFile = true;
              fd.append(
                name,
                new File([files[name]], name, { type: files[name].type })
              );
            }
        }
      });

      if (!customFile) return;

      event.preventDefault();

      await fetch(window.location.origin + "/submit2", {
        method: "post",
        body: fd
      });

      window.location.href = window.location.origin + "/submit";
    });
  }
}
