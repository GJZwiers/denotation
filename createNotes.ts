import { re } from "./getIncrementType.ts";

export function createNotes(commits: string[]): string {
  let notes = "## Release Notes\n\n";

  for (const commit of commits) {
    const cleanCommitMatch = commit.replace(/\n/g, "").match(re);

    if (!cleanCommitMatch || !cleanCommitMatch.groups) {
      continue;
    }

    if (
      cleanCommitMatch.groups.scope !== "(ci)" && (
        cleanCommitMatch.groups.type === "fix" ||
        cleanCommitMatch.groups.type === "feat" ||
        cleanCommitMatch.groups.type === "perf"
      )
    ) {
      // Add Markdown list element to notes.
      notes += "- " + cleanCommitMatch[0] + "\n";
    }
  }

  return notes;
}
