import * as event from "../__fixtures__/malformed-manifest/event";
import { bootstrap } from "./_bootstrap";

describe("integration  malformed-manifest", () => {
  bootstrap(event);
});
