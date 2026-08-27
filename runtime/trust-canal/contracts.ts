export const ADMISSION_RECORD_VERSION = "othrys.v2.admission.v1" as const;

export interface AdmissionActor {
  readonly role: string;
  readonly channel: string;
}

export interface AdmissionInput {
  readonly missionId: string;
  readonly command: string;
  readonly actor: AdmissionActor;
  readonly context: string;
}

export interface AdmissionRecord {
  readonly version: typeof ADMISSION_RECORD_VERSION;
  readonly missionId: string;
  readonly correlationId: string;
  readonly promptDigest: string;
  readonly commandBytes: number;
  readonly actor: AdmissionActor;
  readonly admittedAt: string;
  readonly state: "ADMITTED";
}
