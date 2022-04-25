const describeTag = await Deno.spawn("git", {
  args: [
    "describe",
    "--tags",
    "--abbrev=0",
    "HEAD^",
  ],
});

let tag = new TextDecoder().decode(describeTag.stdout);

if (!tag) throw new Error("No tag found in repository.");

tag = tag.replace(/\s/g, "");

const { status, stdout, stderr } = await Deno.spawn("git", {
  args: [
    "log",
    '--pretty=format:"COMMIT %B"', // Print commit message and body, add NEWCOMMIT separator for easier commit parsing.
    `${tag}..HEAD`,
  ],
});

if (!status.success) {
  const err = new TextDecoder().decode(stderr);
  throw new Error(`subprocess failed: ${err}`);
}

const commits = new TextDecoder().decode(stdout).split("COMMIT");

const re =
  /^ ?(?<type>build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test|¯\\_\(ツ\)_\/¯)(?<scope>\(\w+\)?((?=:\s)|(?=!:\s)))?(?<breaking>!)?(?<subject>:\s.*)?|^(?<merge>Merge \w+)/;

enum Increment {
  Major,
  Minor,
  Patch,
}

const kinds: Increment[] = [];
for (const commit of commits) {
  const lines = commit.split("\n\n");

  const desc = lines[0].match(re);

  if (!desc || !desc.groups) {
    continue;
  }

  if (desc.groups.breaking) {
    kinds.push(Increment.Major);
  } else if (
    lines.length > 1 && /BREAKING[- ]CHANGE/.test(lines[lines.length - 1])
  ) {
    kinds.push(Increment.Major);
  } else if (desc.groups.type === "feat") {
    kinds.push(Increment.Minor);
  } else {
    kinds.push(Increment.Patch);
  }
}

const highest = kinds.reduce((prev, curr) => {
  if (curr === Increment.Major || curr === prev) {
    return curr;
  }
  if (curr === Increment.Minor && prev === Increment.Patch) {
    return curr;
  }
  if (curr === Increment.Minor && prev === Increment.Major) {
    return curr;
  }
  if (curr === Increment.Patch && prev === Increment.Minor) {
    return prev;
  }
  if (curr === Increment.Patch && prev === Increment.Major) {
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
if (highest === Increment.Patch) {
  nextVersion =
    `${semver.groups.v}${semver.groups.major}.${semver.groups.minor}.${
      (parseInt(semver.groups.patch) + 1).toString()
    }`;
} else if (highest === Increment.Minor) {
  nextVersion = `${semver.groups.v}${semver.groups.major}.${
    (parseInt(semver.groups.minor) + 1).toString()
  }}.${semver.groups.patch}`;
} else if (highest === Increment.Major) {
  nextVersion = `${semver.groups.v}${
    (parseInt(semver.groups.major) + 1).toString()
  }.${semver.groups.minor}.${semver.groups.patch}`;
}

console.log(nextVersion);

// v2.5.0
// v2.5.0-alpha.0
