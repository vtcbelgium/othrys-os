export interface EngineeringAcceptance {
  readonly commands: readonly string[];
  readonly criteria: readonly string[];
}

export interface EngineeringCommand {
  readonly missionId: string;
  readonly title: string;
  readonly goal: string;
  readonly constraints: readonly string[];
  readonly workspace: string;
  readonly allowedPaths: readonly string[];
  readonly forbiddenPaths: readonly string[];
  readonly acceptance: EngineeringAcceptance;
  readonly maxAttempts: number;
}

export interface FrozenEngineeringPlan {
  readonly missionId: string;
  readonly commandDigest: string;
  readonly acceptanceDigest: string;
  readonly title: string;
  readonly goal: string;
  readonly constraints: readonly string[];
  readonly workspace: string;
  readonly allowedPaths: readonly string[];
  readonly forbiddenPaths: readonly string[];
  readonly acceptance: EngineeringAcceptance;
  readonly maxAttempts: number;
  readonly buildTask: string;
}
