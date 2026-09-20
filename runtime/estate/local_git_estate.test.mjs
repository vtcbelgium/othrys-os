import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { buildEstateProjection } from "./local_git_estate.mjs";

function run(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

test("live repository estate derives books, products and branch work from a local mirror", async () => {
  const root = mkdtempSync(join(tmpdir(), "othrys-live-estate-"));
  const source = join(root, "source");
  const estate = join(root, "estate");
  const mirror = join(estate, "repos", "fixture.git");
  try {
    mkdirSync(source, { recursive: true });
    run(source, "init", "-b", "main");
    run(source, "config", "user.email", "fixture@example.com");
    run(source, "config", "user.name", "Fixture");
    mkdirSync(join(source, ".othrys"), { recursive: true });
    mkdirSync(join(source, "app", "system"), { recursive: true });
    writeFileSync(join(source, "README.md"), "# Fixture\n\nCanonical documentation.");
    writeFileSync(join(source, ".othrys", "project.json"), JSON.stringify({
      systems: [{ id: "system", label: "System", role: "Fixture system" }],
      authorities: [],
    }));
    writeFileSync(join(source, "package.json"), JSON.stringify({ name: "@fixture/root" }));
    writeFileSync(join(source, "app", "system", "page.tsx"), "export default function Page(){return null}\n");
    run(source, "add", ".");
    run(source, "commit", "-m", "feat: fixture main");

    run(source, "checkout", "-b", "feat/live-test");
    mkdirSync(join(source, "docs"), { recursive: true });
    writeFileSync(join(source, "docs", "branch-only.md"), "# Branch Only\n\nNot on main.");
    run(source, "add", ".");
    run(source, "commit", "-m", "feat: branch-only book");

    mkdirSync(join(estate, "repos"), { recursive: true });
    execFileSync("git", ["clone", "--mirror", source, mirror], { encoding: "utf8" });

    const projection = await buildEstateProjection({
      root: estate,
      repositories: [{
        name: "fixture",
        full_name: "vtcbelgium/fixture",
        private: true,
        visibility: "private",
        description: "Fixture repository",
      }],
      sync: false,
    });

    assert.equal(projection.schema, "othrys.os.repository-estate.v1");
    assert.equal(projection.source, "othrys-os-live-git");
    assert.equal(projection.authorityGranted, false);
    assert.equal(projection.controlsEnabled, false);
    assert.equal(projection.counts.repos, 1);

    const projects = projection.repos[0].projects;
    assert.ok(projects.some((item) => item.kind === "book" && item.path === "README.md"));
    assert.ok(projects.some((item) => item.kind === "product" && item.path === "app/system"));
    assert.ok(projects.some((item) => item.kind === "workstream" && item.branch === "feat/live-test"));
    assert.ok(projects.some((item) => item.kind === "book" && item.path === "docs/branch-only.md" && item.branch === "feat/live-test"));
    assert.equal(projection.repos[0].coverage.trackedFiles, 4);
    assert.equal(projection.repos[0].coverage.representedFiles, 4);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
