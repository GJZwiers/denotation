import { assertEquals } from "https://deno.land/std@0.136.0/testing/asserts.ts";
import { nextRelease, ReleaseType } from "./nextRelease.ts";
import { VersionIncrement } from "./incrementVersion.ts";

Deno.test("should increment version v1.0.0 to v1.0.1 if the next is a patch release", () => {
  const next = nextRelease(
    {
      v: "v",
      major: "1",
      minor: "0",
      patch: "0",
    },
    {
      current: ReleaseType.Release,
      next: ReleaseType.Release,
      increment: VersionIncrement.Patch,
    },
  );

  assertEquals(next, "v1.0.1");
});

Deno.test("should increment version v1.0.0 to v1.1.0 if the next is a minor release", () => {
  const next = nextRelease(
    {
      v: "v",
      major: "1",
      minor: "0",
      patch: "0",
    },
    {
      current: ReleaseType.Release,
      next: ReleaseType.Release,
      increment: VersionIncrement.Minor,
    },
  );

  assertEquals(next, "v1.1.0");
});

Deno.test("should increment version v1.0.0 to v2.0.0 if the next is a major release", () => {
  const next = nextRelease(
    {
      v: "v",
      major: "1",
      minor: "0",
      patch: "0",
    },
    {
      current: ReleaseType.Release,
      next: ReleaseType.Release,
      increment: VersionIncrement.Major,
    },
  );

  assertEquals(next, "v2.0.0");
});

Deno.test("should increment version v1.0.0 to v1.0.1-alpha.0 if the next is a patch prerelease", () => {
  const next = nextRelease(
    {
      v: "v",
      major: "1",
      minor: "0",
      patch: "0",
    },
    {
      current: ReleaseType.Release,
      next: ReleaseType.Prerelease,
      increment: VersionIncrement.Patch,
    },
  );

  assertEquals(next, "v1.0.1-alpha.0");
});

Deno.test("should increment version v1.0.0 to v1.1.0-alpha.0 if the next is a minor prerelease", () => {
  const next = nextRelease(
    {
      v: "v",
      major: "1",
      minor: "0",
      patch: "0",
    },
    {
      current: ReleaseType.Release,
      next: ReleaseType.Prerelease,
      increment: VersionIncrement.Minor,
    },
  );

  assertEquals(next, "v1.1.0-alpha.0");
});

Deno.test("should increment version v1.0.0 to v2.0.0-alpha.0 if the next is a major prerelease", () => {
  const next = nextRelease(
    {
      v: "v",
      major: "1",
      minor: "0",
      patch: "0",
    },
    {
      current: ReleaseType.Release,
      next: ReleaseType.Prerelease,
      increment: VersionIncrement.Major,
    },
  );

  assertEquals(next, "v2.0.0-alpha.0");
});

Deno.test("should increment version v1.0.0-alpha.0 to v1.0.0-alpha.1 if the next is a patch prerelease", () => {
  const next = nextRelease(
    {
      v: "v",
      major: "1",
      minor: "0",
      patch: "0",
      pre: "-alpha.0",
    },
    {
      current: ReleaseType.Prerelease,
      next: ReleaseType.Prerelease,
      increment: VersionIncrement.Patch,
    },
  );

  assertEquals(next, "v1.0.0-alpha.1");
});

Deno.test("should increment version v1.0.0-alpha.0 to v1.1.0-alpha.0 if the next is a minor prerelease", () => {
  const next = nextRelease(
    {
      v: "v",
      major: "1",
      minor: "0",
      patch: "0",
      pre: "-alpha.0",
    },
    {
      current: ReleaseType.Prerelease,
      next: ReleaseType.Prerelease,
      increment: VersionIncrement.Minor,
    },
  );

  assertEquals(next, "v1.1.0-alpha.0");
});

Deno.test("should increment version v1.0.0-alpha.1 to v1.1.0-alpha.0 if the next is a minor prerelease", () => {
  const next = nextRelease(
    {
      v: "v",
      major: "1",
      minor: "0",
      patch: "0",
      pre: "-alpha.1",
    },
    {
      current: ReleaseType.Prerelease,
      next: ReleaseType.Prerelease,
      increment: VersionIncrement.Minor,
    },
  );

  assertEquals(next, "v1.1.0-alpha.0");
});

Deno.test("should increment version v1.0.0-alpha.0 to v2.0.0-alpha.0 if the next is a major prerelease", () => {
  const next = nextRelease(
    {
      v: "v",
      major: "1",
      minor: "0",
      patch: "0",
      pre: "-alpha.0",
    },
    {
      current: ReleaseType.Prerelease,
      next: ReleaseType.Prerelease,
      increment: VersionIncrement.Major,
    },
  );

  assertEquals(next, "v2.0.0-alpha.0");
});
