# js13kGames bot

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier) [![type: typescript](https://img.shields.io/npm/types/typescript.svg?style=flat-square)](https://github.com/microsoft/TypeScript) [![GitHub Workflow Status](https://img.shields.io/github/workflow/status/js13kGames/bot/main?style=flat-square)](https://github.com/js13kGames/bot/actions?query=workflow%3Amain)

> js13kGames automatic submission validation

Exposes an endpoint to run checks on a bundle.zip

- valid size
- valid zip file
- contains index.html
- runs without errors
- runs without requesting external resources
- runs without display a blank screen at launch

## Table of Content

- [Usage](#Usage)
- [Demo](#Demo)
  - [pure html](https://js13kgames.github.io/bot/demo-pure-html.html)
  - [with xhr](https://js13kgames.github.io/bot/demo-xhr.html)
- [License](#License)

## Usage

```sh

curl -X POST \

  # upload your bundle.zip
  --form bundle=@bundle.zip \

  # set the rules for the desktop + mobile categories
  --form category=desktop \
  --form category=mobile \

  # temporary dev endpoint
  https://jwxql7uhq6.execute-api.eu-west-1.amazonaws.com/stage/analyze-bundle
```

```typescript
type Res = {
  // list of checks runs
  checks: {
    id: string;

    // description of what is expected for this check to succeed
    description: string;

    // result of the check
    result: "ok" | "failed" | "untested";

    // if failed, some details / hint on how to fix
    details?: string;
  }[];

  // url to the deployed game, or null if it did not get that far
  deployUrl?: string;

  // list of categories found in the request
  categories: "desktop" | "mobile" | "webxr" | "server";

  // rules applying to this combinaison of categories
  // or null if no rule could be applied
  rules: Rules | null;
};
```

## Demo

[A very simple form](https://js13kgames.github.io/bot/demo-xhr.html)

And an even [simpler one without js](https://js13kgames.github.io/bot/demo-pure-html.html)

There is some bundle.zip samples in [packages/bundle-analyzer/\_\_fixtures\_\_](packages/bundle-analyzer/__fixtures__)

## License

[MIT](./license)
