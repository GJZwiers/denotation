const describeTag = await Deno.spawn("git", {
  args: [
    "describe",
    "--tags",
    "--abbrev=0",
    "HEAD^",
  ],
});

const tag = new TextDecoder().decode(describeTag.stdout);

const { status, stdout, stderr } = await Deno.spawn("git", {
  args: [
    "log",
    '--pretty=format:"NEWCOMMIT %B"', // Print commit message and body, add NEWCOMMIT separator for easier commit parsing.
    `${tag.replace(/\s/g, "")}..HEAD`,
  ],
});

if (!status.success) {
  const err = new TextDecoder().decode(stderr);
  throw new Error(`subprocess failed: ${err}`);
}

// <type>[optional scope]: <description>

// [optional body]

// [optional footer(s)]

const commits = new TextDecoder().decode(stdout).split("NEWCOMMIT");

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
  console.log(desc);

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
