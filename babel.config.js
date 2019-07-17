const path = require("path");

const plugins = [
  "@babel/plugin-proposal-class-properties",

  [
    "babel-plugin-inline-dotenv",
    { path: path.resolve(__dirname, "./.env"), systemVar: "disable" }
  ],

  "@babel/plugin-transform-modules-commonjs"
];

const presets = ["@babel/preset-typescript"];

module.exports = api => {
  api.cache(false);

  return { plugins, presets };
};
