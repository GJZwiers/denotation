import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.136.0/testing/asserts.ts";
import {
  getIncrementType,
  UnconventionalCommitError,
} from "./getIncrementType.ts";
import { VersionIncrement } from "./incrementVersion.ts";

Deno.test("should throw if an unconventional commit header is matched", () => {
  const commit = "did the whole thing in one commit!";
  assertThrows(() => {
    getIncrementType(commit);
  }, UnconventionalCommitError);
});

Deno.test("should return a major version increment when the conventional commit header contains a breaking indicator", () => {
  let commit = "feat!: change API of thing";
  let increment = getIncrementType(commit);
  assertEquals(increment, VersionIncrement.Major);

  commit = "feat!(scope): change API of thing";
  increment = getIncrementType(commit);
  assertEquals(increment, VersionIncrement.Major);

  commit = "feat: change API of thing\n\nBREAKING CHANGE: method changed";
  increment = getIncrementType(commit);
  assertEquals(increment, VersionIncrement.Major);

  commit =
    "feat: change API of thing\n\nmessage body goes here\n\nBREAKING CHANGE: method changed";
  increment = getIncrementType(commit);
  assertEquals(increment, VersionIncrement.Major);
});

Deno.test("should return a minor version increment when the commit type is feat and no breaking indicator is present", () => {
  const commit = "feat: new thing";
  const increment = getIncrementType(commit);
  assertEquals(increment, VersionIncrement.Minor);
});

Deno.test("should return a patch version increment if no 'feat:', 'feat!:', or 'BREAKING CHANGE:' is matched", () => {
  let commit = "fix: found bug";
  let increment = getIncrementType(commit);
  assertEquals(increment, VersionIncrement.Patch);

  commit = "chore(docs): update readme";
  increment = getIncrementType(commit);
  assertEquals(increment, VersionIncrement.Patch);
});
