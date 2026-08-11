import { InfraiFlags, infrai } from "./infrai-flags.ts";
import { decideFollowup } from "./matter-decision.ts";

const input = { matterId: "matter-104", patientDataPresent: true, signedDocumentReady: false, deadlineDays: 5 };
const flags = new InfraiFlags();
const featureEnabled = await infrai.flags.is_enabled(flags, "legal-matter-followup");
console.log(JSON.stringify(decideFollowup(input, featureEnabled)));
