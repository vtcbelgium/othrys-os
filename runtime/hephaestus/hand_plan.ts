import type { FrozenEngineeringPlan } from "./contracts.ts";

export type EngineeringHandMode = "DISJOINT_SLICES" | "ALTERNATIVE_CANDIDATES";
export interface EngineeringHandSpec {
  readonly handId: string;
  readonly allowedPaths: readonly string[];
}

function validId(value: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,31}$/.test(value);
}
function exactPathSet(values: readonly string[]): string {
  return [...values].sort().join("\n");
}

export function planEngineeringHands(
  plan: FrozenEngineeringPlan,
  specs: readonly EngineeringHandSpec[],
  mode: EngineeringHandMode,
) {
  if (!Array.isArray(specs) || specs.length < 1 || specs.length > 3) throw new Error("HAND_BUDGET_INVALID");
  if (!['DISJOINT_SLICES','ALTERNATIVE_CANDIDATES'].includes(mode)) throw new Error("HAND_MODE_INVALID");
  const missionPaths=new Set(plan.allowedPaths), ids=new Set<string>(), claimed=new Set<string>();
  const hands=[];
  for(const spec of specs){
    if(!validId(spec.handId)||ids.has(spec.handId)) throw new Error("HAND_ID_INVALID");
    ids.add(spec.handId);
    if(!Array.isArray(spec.allowedPaths)||spec.allowedPaths.length<1) throw new Error("HAND_PATHS_REQUIRED");
    if(new Set(spec.allowedPaths).size!==spec.allowedPaths.length) throw new Error("HAND_PATH_DUPLICATE");
    for(const path of spec.allowedPaths){
      if(!missionPaths.has(path)) throw new Error("HAND_SCOPE_VIOLATION");
      if(mode==='DISJOINT_SLICES'&&claimed.has(path)) throw new Error("HAND_SCOPE_OVERLAP");
      claimed.add(path);
    }
    hands.push(Object.freeze({
      handId:spec.handId,
      allowedPaths:Object.freeze([...spec.allowedPaths]),
      isolationRequired:true,
      workspacePolicy:'SEPARATE_WORKTREE_REQUIRED',
      authorityGranted:false,
      executionStarted:false,
    }));
  }
  if(mode==='ALTERNATIVE_CANDIDATES'){
    const expected=exactPathSet(specs[0].allowedPaths);
    if(specs.some(spec=>exactPathSet(spec.allowedPaths)!==expected)) throw new Error("ALTERNATIVE_SCOPE_MISMATCH");
  }
  return Object.freeze({
    schema:'othrys.hephaestus.hand-plan.v0.1',
    missionId:plan.missionId,
    acceptanceDigest:plan.acceptanceDigest,
    mode,
    handCount:hands.length,
    hands:Object.freeze(hands),
    fanInPolicy:mode==='DISJOINT_SLICES'?'VERIFY_MERGE_DISJOINT':'VERIFY_SELECT_ONE',
    authorityGranted:false,
    executionStarted:false,
  });
}
