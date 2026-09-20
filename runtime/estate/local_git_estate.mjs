import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";
import { connectPackages, readCatalog } from "./catalog.mjs";

export const ESTATE_SCHEMA = "othrys.os.repository-estate.v1";
export const DEFAULT_ESTATE_ROOT = join(homedir(), ".othrys", "estate");

export const DEFAULT_REPOSITORIES = Object.freeze([
  { name: "othrys-blocks", full_name: "vtcbelgium/othrys-blocks", private: true, visibility: "private", description: "Reusable OTHRYS Blocks and capabilities." },
  { name: "othrys-os", full_name: "vtcbelgium/othrys-os", private: false, visibility: "public", description: "OTHRYS operating system and governance runtime." },
  { name: "othrys-web", full_name: "vtcbelgium/othrys-web", private: true, visibility: "private", description: "OTHRYS Web, System Manager and personal surfaces." },
  { name: "vtc-platform", full_name: "vtcbelgium/vtc-platform", private: true, visibility: "private", description: "VTC platform product repository." },
]);

function git(repoPath, args, { allowFailure = false, encoding = "utf8" } = {}) {
  const run = spawnSync("git", ["--git-dir", repoPath, ...args], {
    encoding,
    timeout: 30_000,
    maxBuffer: 32 * 1024 * 1024,
  });
  if (run.status !== 0 && !allowFailure) {
    throw new Error((run.stderr || run.stdout || `git ${args.join(" ")} failed`).trim());
  }
  return run.status === 0 ? run.stdout : null;
}

function gitLines(repoPath, args) {
  const out = git(repoPath, args) ?? "";
  return out.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function repoPath(root, repo) {
  return join(root, "repos", repo.name + ".git");
}

function repoUrl(repo) {
  return `https://github.com/${repo.full_name}.git`;
}

function githubUrl(repo) {
  return `https://github.com/${repo.full_name}`;
}

export function ensureMirror(root, repo) {
  const target = repoPath(root, repo);
  mkdirSync(join(root, "repos"), { recursive: true });
  if (!existsSync(target)) {
    const run = spawnSync("git", ["clone", "--mirror", repoUrl(repo), target], {
      encoding: "utf8",
      timeout: 120_000,
      maxBuffer: 32 * 1024 * 1024,
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    });
    if (run.status !== 0) throw new Error((run.stderr || run.stdout || "git clone failed").trim());
  }
  const fetch = spawnSync("git", ["--git-dir", target, "fetch", "--quiet", "--prune", "origin"], {
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
  });
  if (fetch.status !== 0) throw new Error((fetch.stderr || fetch.stdout || "git fetch failed").trim());
  return target;
}

function decodeRepoApiPath(path) {
  const url = new URL("https://local.invalid" + path);
  return { pathname: url.pathname, search: url.searchParams };
}

function localApi(repo, mirror) {
  const prefix = `/repos/${repo.full_name}`;
  return async (path) => {
    const { pathname, search } = decodeRepoApiPath(path);
    if (!pathname.startsWith(prefix + "/")) throw new Error("LOCAL_GIT_API_REPO_MISMATCH");

    const rest = pathname.slice(prefix.length);
    if (rest.startsWith("/commits/")) {
      const ref = decodeURIComponent(rest.slice("/commits/".length));
      const sha = (git(mirror, ["rev-parse", ref + "^{commit}"]) ?? "").trim();
      return { sha };
    }

    if (rest.startsWith("/git/trees/")) {
      const sha = decodeURIComponent(rest.slice("/git/trees/".length));
      const rows = gitLines(mirror, ["ls-tree", "-r", sha]).map((line) => {
        const match = line.match(/^(\d+)\s+(\w+)\s+([0-9a-f]+)\t(.+)$/);
        if (!match) return null;
        return { mode: match[1], type: match[2], sha: match[3], path: match[4] };
      }).filter(Boolean);
      return { sha, truncated: false, tree: rows };
    }

    if (rest.startsWith("/git/blobs/")) {
      const sha = decodeURIComponent(rest.slice("/git/blobs/".length));
      const bytes = git(mirror, ["cat-file", "blob", sha], { encoding: null });
      return { encoding: "base64", content: Buffer.from(bytes ?? Buffer.alloc(0)).toString("base64") };
    }

    if (rest.startsWith("/contents/")) {
      const encoded = rest.slice("/contents/".length);
      const filePath = encoded.split("/").map(decodeURIComponent).join("/");
      const ref = search.get("ref") || "main";
      const bytes = git(mirror, ["show", `${ref}:${filePath}`], { encoding: null });
      return { encoding: "base64", content: Buffer.from(bytes ?? Buffer.alloc(0)).toString("base64"), path: filePath };
    }

    throw new Error(`LOCAL_GIT_API_UNSUPPORTED: ${path}`);
  };
}

function statusForBranch(branch) {
  if (/^(archive|retired)\//i.test(branch)) return "archived";
  if (/^(recovery|quarantine)\//i.test(branch)) return "quarantine";
  if (/^(docs|research|study)\//i.test(branch)) return "research";
  if (/^fix\//i.test(branch)) return "review";
  return "active";
}

function titleFromRef(ref) {
  return ref
    .replace(/^(feat|feature|fix|docs|chore|research|archive|recovery)\//, "")
    .replaceAll("/", "-")
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.length <= 3 ? part.toUpperCase() : part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function currentBranches(mirror) {
  return gitLines(mirror, ["for-each-ref", "--format=%(refname:short)|%(objectname)|%(committerdate:iso-strict)", "refs/heads"])
    .map((line) => {
      const [name, sha, date] = line.split("|");
      return { name, sha, date };
    });
}

function compareBranch(mirror, base, branch) {
  const counts = (git(mirror, ["rev-list", "--left-right", "--count", `${base}...${branch}`], { allowFailure: true }) ?? "").trim().split(/\s+/);
  const behindBy = Number(counts[0] || 0);
  const aheadBy = Number(counts[1] || 0);
  const changedFiles = aheadBy > 0
    ? gitLines(mirror, ["diff", "--name-only", `${base}...${branch}`])
    : [];
  return { aheadBy, behindBy, changedFiles };
}

function branchWorkstreams(repo, mirror, generatedAt) {
  const base = "main";
  const projects = [];
  for (const branch of currentBranches(mirror)) {
    if (branch.name === base) continue;
    const compare = compareBranch(mirror, base, branch.name);
    if (compare.aheadBy === 0) continue;

    const plain = {
      id: `${repo.name}:branch:${branch.name}`,
      repo: repo.name,
      repoFullName: repo.full_name,
      kind: "workstream",
      title: titleFromRef(branch.name),
      status: statusForBranch(branch.name),
      summary: `Branch is ${compare.aheadBy} commit${compare.aheadBy === 1 ? "" : "s"} ahead and ${compare.behindBy} behind main.`,
      branch: branch.name,
      branchHead: branch.sha,
      pullRequest: null,
      lastActivity: branch.date || null,
      aheadBy: compare.aheadBy,
      behindBy: compare.behindBy,
      changedFiles: compare.changedFiles,
      githubUrl: `${githubUrl(repo)}/tree/${encodeURIComponent(branch.name)}`,
      sourceReason: "Automatically derived from the current local Git mirror on T590.",
      statusReason: "Live branch evidence from the T590 read replica; no pull-request state is inferred.",
    };
    projects.push(plain);
  }
  return projects;
}

function recentFinished(repo, mirror) {
  const rows = gitLines(mirror, ["log", "main", "-n", "80", "--pretty=format:%H%x1f%cI%x1f%s"]);
  const seen = new Set();
  const finished = [];
  for (const row of rows) {
    const [sha, date, subject] = row.split("\x1f");
    const match = subject?.match(/\(#(\d+)\)\s*$/);
    if (!match) continue;
    const number = Number(match[1]);
    if (seen.has(number)) continue;
    seen.add(number);
    const title = subject.replace(/\s*\(#\d+\)\s*$/, "").trim();
    finished.push({
      id: `${repo.name}:merged-pr:${number}`,
      repo: repo.name,
      repoFullName: repo.full_name,
      kind: "finished",
      title,
      status: "finished",
      summary: "Merged work derived from current main history.",
      branch: null,
      branchHead: sha,
      pullRequest: {
        number,
        title,
        url: `${githubUrl(repo)}/pull/${number}`,
        draft: false,
        state: "closed",
        mergedAt: date || null,
      },
      lastActivity: date || null,
      aheadBy: 0,
      behindBy: 0,
      changedFiles: gitLines(mirror, ["diff-tree", "--no-commit-id", "--name-only", "-r", sha]).slice(0, 100),
      githubUrl: `${githubUrl(repo)}/commit/${sha}`,
      sourceReason: "Automatically derived from current main commit history on the T590 read replica.",
      statusReason: `Main contains merged PR #${number} evidence at ${date || "unknown time"}.`,
    });
  }
  return finished;
}

async function inspectMirror(repo, mirror, generatedAt) {
  const head = (git(mirror, ["rev-parse", "main^{commit}"]) ?? "").trim();
  const updatedAt = (git(mirror, ["log", "-1", "--format=%cI", "main"]) ?? "").trim();
  const workstreams = [...branchWorkstreams(repo, mirror, generatedAt), ...recentFinished(repo, mirror)];
  const api = localApi(repo, mirror);
  const catalog = await readCatalog(api, {
    ...repo,
    html_url: githubUrl(repo),
    default_branch: "main",
    updated_at: updatedAt,
  }, workstreams, generatedAt);

  return {
    id: repo.name,
    name: repo.name,
    fullName: repo.full_name,
    url: githubUrl(repo),
    description: repo.description,
    visibility: repo.visibility,
    defaultBranch: "main",
    updatedAt,
    sourceCommit: head,
    ...catalog,
  };
}

export async function buildEstateProjection({
  root = DEFAULT_ESTATE_ROOT,
  repositories = DEFAULT_REPOSITORIES,
  sync = true,
} = {}) {
  const generatedAt = new Date().toISOString();
  const syncResults = [];
  const repos = [];

  for (const repo of repositories) {
    const target = repoPath(root, repo);
    let fetchOk = true;
    let fetchError = null;
    try {
      if (sync) ensureMirror(root, repo);
      else if (!existsSync(target)) throw new Error("MIRROR_ABSENT");
    } catch (error) {
      fetchOk = false;
      fetchError = error instanceof Error ? error.message : String(error);
      if (!existsSync(target)) throw error;
    }

    const projected = await inspectMirror(repo, target, generatedAt);
    repos.push(projected);
    syncResults.push({
      repo: repo.name,
      mirror: target,
      fetchOk,
      fetchError,
      sourceCommit: projected.sourceCommit,
      updatedAt: projected.updatedAt,
    });
  }

  const connected = connectPackages(repos);
  const projects = connected.flatMap((repo) => repo.projects);
  const value = {
    schema: ESTATE_SCHEMA,
    generatedAt,
    source: "othrys-os-live-git",
    owner: "vtcbelgium",
    authorityGranted: false,
    controlsEnabled: false,
    sync: {
      completedAt: generatedAt,
      repos: syncResults,
      degraded: syncResults.some((item) => !item.fetchOk),
    },
    repos: connected,
    counts: {
      repos: connected.length,
      projects: projects.length,
      active: projects.filter((project) => ["active", "review", "draft"].includes(project.status)).length,
      finished: projects.filter((project) => project.status === "finished").length,
      parked: projects.filter((project) => ["research", "quarantine", "archived", "parked"].includes(project.status)).length,
    },
  };
  return Object.freeze(value);
}

export async function syncEstateToDisk({
  root = DEFAULT_ESTATE_ROOT,
  repositories = DEFAULT_REPOSITORIES,
} = {}) {
  mkdirSync(root, { recursive: true });
  const value = await buildEstateProjection({ root, repositories, sync: true });
  const target = join(root, "estate.json");
  const temp = target + ".tmp-" + process.pid;
  writeFileSync(temp, JSON.stringify(value));
  renameSync(temp, target);
  return value;
}

export function readEstateProjection({ root = DEFAULT_ESTATE_ROOT } = {}) {
  const target = join(root, "estate.json");
  if (!existsSync(target)) {
    return Object.freeze({
      schema: ESTATE_SCHEMA,
      status: "ABSENT",
      generatedAt: null,
      source: "othrys-os-live-git",
      owner: "vtcbelgium",
      authorityGranted: false,
      controlsEnabled: false,
      repos: [],
      counts: { repos: 0, projects: 0, active: 0, finished: 0, parked: 0 },
    });
  }
  const value = JSON.parse(readFileSync(target, "utf8"));
  if (value.schema !== ESTATE_SCHEMA || value.authorityGranted !== false || value.controlsEnabled !== false) {
    throw new Error("REPOSITORY_ESTATE_INVALID");
  }
  return Object.freeze(value);
}

if (import.meta.url === `file://${resolve(process.argv[1] || "")}`) {
  syncEstateToDisk().then((value) => {
    process.stdout.write(JSON.stringify({
      schema: value.schema,
      generatedAt: value.generatedAt,
      counts: value.counts,
      degraded: value.sync.degraded,
      repos: value.sync.repos.map(({ repo, fetchOk, sourceCommit }) => ({ repo, fetchOk, sourceCommit })),
    }) + "\n");
  }).catch((error) => {
    process.stderr.write((error instanceof Error ? error.stack : String(error)) + "\n");
    process.exitCode = 1;
  });
}
