import { execFileSync } from "node:child_process";
import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const staticRoots = [
  "index.html",
  "assets",
  "games",
  "info",
  "src",
  "styles",
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const files = execFileSync("git", ["ls-files", "-z", ...staticRoots], {
  cwd: root,
}).toString("utf8").split("\0").filter(Boolean);

for (const file of files) {
  const target = join(dist, file);
  await mkdir(dirname(target), { recursive: true });
  await cp(join(root, file), target, { force: true });
}

console.log(`Vercel static build complete: copied ${files.length} files to dist.`);
