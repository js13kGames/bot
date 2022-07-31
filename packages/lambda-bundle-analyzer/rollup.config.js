import esbuild from "rollup-plugin-esbuild";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import sizes from "rollup-plugin-sizes";
import * as path from "path";
import * as fs from "fs";

const outDir = path.join(__dirname, "../../build");

const dependencies = {
  ...require("./package.json").dependencies,
  ...require("../bundle-analyzer/package.json").dependencies,
};
for (const d in dependencies)
  if (d.startsWith("js13kGames-bot")) delete dependencies[d];

// write a package.json file in the build dir
// it's a pretty bad pattern to do that here
// but I am tired
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outDir + "/package.json", JSON.stringify({ dependencies }));

export default {
  plugins: [
    sizes(),
    resolve({
      moduleDirectories: ["./node_modules", "../../node_modules"],
      extensions: [".mjs", ".js", ".json", ".ts"],
      preferBuiltins: true,
    }),
    json(),
    commonjs(),
    esbuild({
      target: "esnext",
    }),
  ],
  external: Object.keys(dependencies),
  output: {
    dir: outDir,
    format: "cjs",
  },
};
