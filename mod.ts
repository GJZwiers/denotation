import { writeAll } from "https://deno.land/std@0.136.0/streams/mod.ts";
import { spawnProcess } from "./spawnProcess.ts";

const gitDescribeStdout = await spawnProcess("git", [
  "describe",
  "--tags",
  "--abbrev=0",
  "HEAD^",
]);

const decoder = new TextDecoder();
let tag = decoder.decode(gitDescribeStdout);

if (!tag) {
  throw new Error("No tag found in repository.");
}
tag = tag.replace(/\s/g, "");

const gitLogStdout = await spawnProcess("git", [
  "log",
  '--pretty=format:"COMMIT %B"', // Print commit message and body, add COMMIT separator for easier commit parsing.
  `${tag}..HEAD`,
]);

enum VersionIncrement {
  Major,
  Minor,
  Patch,
  Unconventional,
}

const commits = decoder.decode(gitLogStdout).split("COMMIT");
console.log(commits);


const re =
  /^ ?(?<type>build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test|¯\\_\(ツ\)_\/¯)(?<scope>\(\w+\)?((?=:\s)|(?=!:\s)))?(?<breaking>!)?(?<subject>:\s.*)?|^(?<merge>Merge \w+)/;

const increments: VersionIncrement[] = commits.map((commit) => {
  const lines = commit.split("\n\n");
  const convCommitHeader = lines[0].match(re);

  if (!convCommitHeader || !convCommitHeader.groups) {
    return VersionIncrement.Unconventional;
  }

  const footer = lines[lines.length - 1];
  if (convCommitHeader.groups.breaking) {
    return VersionIncrement.Major;
  } else if (lines.length > 1 && /BREAKING[- ]CHANGE/.test(footer)) {
    return VersionIncrement.Major;
  } else if (convCommitHeader.groups.type === "feat") {
    return VersionIncrement.Minor;
  } else {
    return VersionIncrement.Patch;
  }
});
 
const increment = increments.reduce((prev, curr) => {
  if (curr === VersionIncrement.Major || curr === prev) {
    return curr;
  }
  if (curr === VersionIncrement.Minor && prev === VersionIncrement.Patch) {
    return curr;
  }
  if (curr === VersionIncrement.Minor && prev === VersionIncrement.Major) {
    return prev;
  }
  if (curr === VersionIncrement.Patch && prev === VersionIncrement.Minor) {
    return prev;
  }
  if (curr === VersionIncrement.Patch && prev === VersionIncrement.Major) {
    return prev;
  }

  return curr;
});

const semver = tag.match(
  /^(?<v>v)?(?<major>\d{1,4})\.(?<minor>\d{1,4})\.(?<patch>\d{1,4})$/,
);
if (!semver || !semver.groups) {
  throw new Error("Tag has invalid or unsupported format (semver)");
}

let nextVersion;
if (increment === VersionIncrement.Patch) {
  nextVersion =
    `${semver.groups.v}${semver.groups.major}.${semver.groups.minor}.${
      (parseInt(semver.groups.patch) + 1).toString()
    }`;
} else if (increment === VersionIncrement.Minor) {
  nextVersion = `${semver.groups.v}${semver.groups.major}.${
    (parseInt(semver.groups.minor) + 1).toString()
  }}.${semver.groups.patch}`;
} else if (increment === VersionIncrement.Major) {
  nextVersion = `${semver.groups.v}${
    (parseInt(semver.groups.major) + 1).toString()
  }.${semver.groups.minor}.${semver.groups.patch}`;
}

console.log(nextVersion);
if (!nextVersion) {
  throw new Error("Something went wrong determining the next semantic version");
}

await writeAll(Deno.stdout, new TextEncoder().encode(nextVersion));

// v2.5.0
// v2.5.0-alpha.0
