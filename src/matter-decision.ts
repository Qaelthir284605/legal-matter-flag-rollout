export type MatterIntake = {
  matterId: string;
  patientDataPresent: boolean;
  signedDocumentReady: boolean;
  deadlineDays: number;
};

export type Followup = { matterId: string; action: "send-signed-document" | "set-deadline-followup" | "hold" };

export function decideFollowup(input: MatterIntake, featureEnabled: boolean): Followup {
  if (!featureEnabled || !input.patientDataPresent) return { matterId: input.matterId, action: "hold" };
  if (!input.signedDocumentReady) return { matterId: input.matterId, action: "send-signed-document" };
  return { matterId: input.matterId, action: "set-deadline-followup" };
}
