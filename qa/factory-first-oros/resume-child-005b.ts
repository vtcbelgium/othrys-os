import { loadFactoryRun, resumeDecision } from "../../runtime/factory/run.ts";
const path = process.argv[2];
if (!path) process.exit(2);
const run = loadFactoryRun(path);
console.log(JSON.stringify({ orosId: run.orosId, status: run.status, candidateCommit: run.candidateCommit, decision: resumeDecision(run), released: run.released }));
