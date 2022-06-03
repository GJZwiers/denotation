import { Options } from "./cli.ts";
import { createNotes } from "./createNotes.ts";
import { writeAll } from "./deps.ts";
import { getIncrementType } from "./getIncrementType.ts";
import { highestIncrement, VersionIncrement } from "./incrementVersion.ts";
import { nextRelease } from "./nextRelease.ts";
import { spawnProcess } from "./spawnProcess.ts";

export async function main(options: Options) {
  const gitDescribeStdout = await spawnProcess("git", [
    "describe",
    "--tags",
    "--abbrev=0",
    "HEAD",
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

  if (commits.length === 0) {
    throw new Error(
      "No commits have been made since the last tag was created.",
    );
  }

  const increments: VersionIncrement[] = commits.map(getIncrementType);

  const increment = increments.reduce(highestIncrement);

  // Source: https://ihateregex.io/expr/semver/
  const semver = tag.match(
    /^(?<v>v)?(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-(?<pre>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<build>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
  );
  if (!semver || !semver.groups) {
    throw new Error(`Invalid semantic versioning format for tag: ${tag}`);
  }

  if (!semver.groups.v) {
    semver.groups.v === "";
  }

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

  if (options.filterNotes) {
    const notes = createNotes(commits);
    // TODO: refactor
    const args = (options.prerelease)
      ? [
        "release",
        "create",
        "--prerelease",
        "--draft",
        "--title",
        nextVersion,
        "--notes",
        notes,
        nextVersion,
      ]
      : [
        "release",
        "create",
        "--draft",
        "--title",
        nextVersion,
        "--notes",
        notes,
        nextVersion,
      ];

    return await spawnProcess("gh", args);
  }

  const args = (options.prerelease)
    ? [
      "release",
      "create",
      "--prerelease",
      "--draft",
      "--generate-notes",
      nextVersion,
    ]
    : [
      "release",
      "create",
      "--draft",
      "--generate-notes",
      nextVersion,
    ];

  await spawnProcess("gh", args);

  await writeAll(Deno.stdout, new TextEncoder().encode(nextVersion));
}
