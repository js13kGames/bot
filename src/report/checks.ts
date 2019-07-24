import { Control } from "../analyze/control";
import { Check } from "../services/github";

const generateCheck = (control: Control) => {
  switch (control.name) {
    case "bundle-found":
      return {
        name: "bundle found",
        output: {
          title: "",
          summary: "",
          text: `> ${control.assetFiles.join(", ")}`
        }
      };

    case "bundle-unzipped":
      return {
        name: "bundle unzipped",
        output: {
          title: "",
          summary: ""
        }
      };

    case "bundle-size":
      return {
        name: "bundle size",
        output: {
          title: "",
          summary: "",
          text: `> ${control.bundleSize}, ${control.sizeLimit}`
        }
      };

    case "index-found":
      return {
        name: "index found",
        output: {
          title: "",
          summary: "",
          text: `> ${control.deployUrl || ""}\n> ${control.bundleFiles.join(
            ", "
          )}`
        }
      };

    case "run-without-error":
      return {
        name: "run without error",
        output: {
          title: "",
          summary: "",
          text: control.errors.map(s => "> - " + s).join("\n")
        }
      };

    case "run-without-blank-screen":
      return {
        name: "run without blank screen",
        output: {
          title: "",
          summary: "",
          text: `> ${control.screenShotUrl}`
        }
      };

    case "run-without-external-http":
      return {
        name: "run without external http",
        output: {
          title: "",
          summary: "",
          text:
            control.urls && control.externalUrls
              ? "> " +
                control.urls.join(", ") +
                "\n> " +
                control.externalUrls.join(", ")
              : ""
        }
      };
  }
};

const parseCheck = (check: Check) => {
  switch (check.name) {
    case "bundle found":
      return {
        name: "bundle-found",
        assetFiles: check.output.text
          .slice(2)
          .split(", ")
          .filter(Boolean)
      };

    case "bundle unzipped":
      return {
        name: "bundle-unzipped"
      };

    case "bundle size": {
      const [bundleSize, sizeLimit] = check.output.text.slice(2).split(", ");
      return {
        name: "bundle-size",
        bundleSize: +bundleSize,
        sizeLimit: +sizeLimit
      };
    }

    case "index found": {
      const [u, e] = (check.output.text || "").split("\n> ");
      return {
        name: "index-found",
        deployUrl: u.slice(2) || undefined,
        bundleFiles: e.split(", ").filter(Boolean)
      };
    }

    case "run without error":
      return {
        name: "run-without-error",
        errors: check.output.text
          .split("\n")
          .map(s => s.slice(4))
          .filter(Boolean)
      };

    case "run without blank screen":
      return {
        name: "run-without-blank-screen",
        screenShotUrl: check.output.text.slice(2)
      };

    case "run without external http": {
      if (!check.output.text)
        return {
          name: "run-without-external-http",
          urls: undefined,
          externalUrls: undefined
        };

      const [u, e = ""] = check.output.text.slice(2).split("\n> ");

      return {
        name: "run-without-external-http",
        urls: u.split(", ").filter(Boolean),
        externalUrls: e.split(", ").filter(Boolean)
      };
    }
  }
};

export const generateChecks = (controls?: Control[]): Check[] =>
  controls.map(
    c =>
      ({
        ...generateCheck(c),
        conclusion: c.conclusion
      } as any)
  );

export const parseChecks = (checks: Check[]): Control[] =>
  checks.map(
    c =>
      ({
        ...parseCheck(c),
        conclusion: c.conclusion
      } as any)
  );
