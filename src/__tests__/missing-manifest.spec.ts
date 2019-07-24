import * as event from "../__fixtures__/missing-manifest/event";
import { bootstrap } from "./_bootstrap";

describe("integration  missing-manifest", () => {
  bootstrap(event);
});
