import { assertEquals } from "https://deno.land/std@0.136.0/testing/asserts.ts";
import { highestIncrement, VersionIncrement } from "./incrementVersion.ts";

Deno.test("should return current increment if previous increment is equal", () => {
  assertEquals(
    highestIncrement(VersionIncrement.Minor, VersionIncrement.Minor),
    VersionIncrement.Minor,
  );
});

Deno.test("should return major version increment if previous is minor increment", () => {
  assertEquals(
    highestIncrement(VersionIncrement.Major, VersionIncrement.Minor),
    VersionIncrement.Major,
  );
});

Deno.test("should return major version increment if previous is patch increment", () => {
  assertEquals(
    highestIncrement(VersionIncrement.Major, VersionIncrement.Patch),
    VersionIncrement.Major,
  );
});

Deno.test("should return minor version increment if previous is a patch", () => {
  assertEquals(
    highestIncrement(VersionIncrement.Minor, VersionIncrement.Patch),
    VersionIncrement.Minor,
  );
});

Deno.test("should return minor version increment if previous is a patch and current is minor", () => {
  assertEquals(
    highestIncrement(VersionIncrement.Patch, VersionIncrement.Minor),
    VersionIncrement.Minor,
  );
});

Deno.test("should return patch version increment if previous is a patch", () => {
  assertEquals(
    highestIncrement(VersionIncrement.Patch, VersionIncrement.Patch),
    VersionIncrement.Patch,
  );
});
