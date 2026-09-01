/**
 * Guards on untrusted model output in the merge path. Both cases here were
 * real: the engine returned codes as bare strings, and a hypothesis with no
 * name at all, each of which took down a live round.
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { normalizeCodes } from "./engine.js";

test("normalizeCodes drops entries without a system and code", () => {
  assert.deepEqual(normalizeCodes([{ system: "ICD-10" }, { code: "I00" }, {}]), undefined);
  assert.deepEqual(normalizeCodes([":", "   ", null, 42]), undefined);
});

test("normalizeCodes recovers the bare-string form the engine emits", () => {
  assert.deepEqual(normalizeCodes(["ICD-10:I00"]), [{ system: "ICD-10", code: "I00" }]);
  assert.deepEqual(normalizeCodes(["SNOMED: 373170000 Viral arthropathy"]), [
    { system: "SNOMED", code: "373170000", display: "Viral arthropathy" },
  ]);
});

test("normalizeCodes keeps good entries alongside bad ones", () => {
  assert.deepEqual(normalizeCodes([":", { system: "ICD-10", code: "I00" }]), [
    { system: "ICD-10", code: "I00" },
  ]);
});

test("normalizeCodes ignores a non-array", () => {
  assert.equal(normalizeCodes("ICD-10:I00"), undefined);
  assert.equal(normalizeCodes(undefined), undefined);
});
