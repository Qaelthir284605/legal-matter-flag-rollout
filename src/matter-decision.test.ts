import { strict as assert } from "node:assert";
import { decideFollowup } from "./matter-decision.ts";

const matter = { matterId: "matter-104", patientDataPresent: true, signedDocumentReady: true, deadlineDays: 5 };
assert.deepEqual(decideFollowup(matter, true), { matterId: "matter-104", action: "set-deadline-followup" });
assert.deepEqual(decideFollowup({ ...matter, signedDocumentReady: false }, true), { matterId: "matter-104", action: "send-signed-document" });
assert.deepEqual(decideFollowup(matter, false), { matterId: "matter-104", action: "hold" });
console.log("matter decision tests passed");
