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
    '--pretty=format:"%s"', // print commit message only
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

const commits = new TextDecoder().decode(stdout).split("\n");

// split commit by newline, get first and last element?

const conventialCommitRegex =
  /^"(?<type>\w+?)(?<scope>\(\w*?\))?(?<breaking>!)?:(?<desc>.*?)$(?:\n\n(?<body>.*))?(?:$\n\n(?<footer>.*)$)?/ms;

for (const commit of commits) {
  console.log(commit.split("\n"));
  const lines = commit.split("\n");

  const header = lines[0];
  const footer = lines[lines.length - 1];

  const patchCommit = commit.match(conventialCommitRegex);

  // console.log(patchCommit);
}
