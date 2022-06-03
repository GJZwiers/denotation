import { assertEquals } from "https://deno.land/std@0.136.0/testing/asserts.ts";
import { createNotes } from "./createNotes.ts";

const header = "## Release Notes\n\n";

// These tests assume that --filter-notes is passed to the CLI.
Deno.test("returns header only if zero commits are passed", () => {
  const notes = createNotes([]);
  assertEquals(notes, header);
});

Deno.test("excludes dev-only commits", () => {
  const notes = createNotes([
    "ci: added something something",
    "build: added something something",
    "fix(ci): fixed it!",
    "chore: clean up code",
    "how did I get in here",
  ]);
  assertEquals(notes, header);
});

Deno.test("adds valid conventional commit type and scope to the notes as a markdown list item", () => {
  let commit = "fix: added something something";
  let notes = createNotes([
    commit,
  ]);

  assertEquals(notes, header + "- " + commit + "\n");

  commit = "fix(stuff): added something something";
  notes = createNotes([
    commit,
  ]);

  assertEquals(
    notes,
    header + "- " + commit + "\n",
  );

  const commitOne = "fix(stuff): added something something";
  const commitTwo = "feat(bla): did this and that";
  const commitThree = "perf(all): lazor blazor fast update";

  notes = createNotes([
    commitOne,
    commitTwo,
    commitThree,
  ]);

  assertEquals(
    notes,
    header + "- " + commitOne + "\n- " + commitTwo + "\n- " + commitThree +
      "\n",
  );

  commit = "feat(bigtime)!: added something breaking";
  notes = createNotes([
    commit,
  ]);

  assertEquals(
    notes,
    header + "- " + commit + "\n",
  );
});
