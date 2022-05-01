import { Options } from "./cli.ts";
import { writeAll } from "./deps.ts";
import { highestIncrement, VersionIncrement } from "./incrementVersion.ts";
import { nextRelease } from "./nextRelease.ts";
import { spawnProcess } from "./spawnProcess.ts";

export async function main(options: Options) {
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

  const commitSeparator = "COMMIT ";
  const gitLogStdout = await spawnProcess("git", [
    "log",
    `--pretty=format:${commitSeparator}%B`, // Print commit message and body, add COMMIT separator for easier commit parsing.
    `${tag}..HEAD`,
  ]);

  const commits = decoder.decode(gitLogStdout)
    .split(commitSeparator)
    .filter((element) => element); // Filter empty strings.

  const re =
    /^ ?(?<type>build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test|¯\\_\(ツ\)_\/¯)(?<scope>\(\w+\)?((?=:\s)|(?=!:\s)))?(?<breaking>!)?(?<subject>:\s.*)?|^(?<merge>Merge \w+)/;

  const increments: VersionIncrement[] = commits.map((commit) => {
    const lines = commit.split("\n\n");
    const convCommitHeader = lines[0].match(re);

    if (!convCommitHeader || !convCommitHeader.groups) {
      throw new Error(
        `Found commit with invalid conventional commit format: ${convCommitHeader}`,
      );
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

  const increment = increments.reduce(highestIncrement);

  // /^(?<v>v)?(?<major>\d{1,4})\.(?<minor>\d{1,4})\.(?<patch>\d{1,4})(?<pre>-[0-9A-Za-z-]\.)?$/
  const semver = tag.match(
    /^(?<v>v)?(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-(?<pre>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<build>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
  );
  if (!semver || !semver.groups) {
    throw new Error(`Invalid semantic versioning format for tag: ${tag}`);
  }

  console.log(semver);
  if (semver.groups.pre) {
    console.log(semver.groups.pre);
  }

  enum ReleaseType {
    Release,
    Prerelease,
  }

  const currentReleaseType = (semver.groups.pre)
    ? ReleaseType.Prerelease
    : ReleaseType.Release;
  const nextReleaseType = (options.prerelease)
    ? ReleaseType.Prerelease
    : ReleaseType.Release;

  const nextVersion = nextRelease(semver.groups, {
    current: currentReleaseType,
    next: nextReleaseType,
    increment,
  });

  if (!nextVersion) {
    throw new Error(
      "Something went wrong determining the next semantic version.",
    );
  }

  // await spawnProcess("gh", [
  //   "release",
  //   "create",
  //   "--draft",
  //   "--generate-notes",
  //   nextVersion,
  // ]);

  await writeAll(Deno.stdout, new TextEncoder().encode(nextVersion));
}
