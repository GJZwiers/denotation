import { VersionIncrement } from "./incrementVersion.ts";

export class UnconventionalCommitError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
  }
}

const re =
  /^ ?(?<type>build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test|¯\\_\(ツ\)_\/¯)(?<scope>\(\w+\)?((?=:\s)|(?=!:\s)))?(?<breaking>!)?(?<subject>:\s.*)?|^(?<merge>Merge \w+)/;

export function getIncrementType(commit: string) {
  const lines = commit.split("\n\n");
  const convCommitHeader = lines[0].match(re);

  if (!convCommitHeader || !convCommitHeader.groups) {
    throw new UnconventionalCommitError(
      `Found commit with invalid conventional commit format: ${convCommitHeader}`,
    );
  }

  const footer = lines[lines.length - 1];
  if (convCommitHeader.groups.breaking) {
    return VersionIncrement.Major;
  } else if (lines.length > 1 && /BREAKING[- ]CHANGE:/.test(footer)) {
    return VersionIncrement.Major;
  } else if (convCommitHeader.groups.type === "feat") {
    return VersionIncrement.Minor;
  } else {
    return VersionIncrement.Patch;
  }
}
