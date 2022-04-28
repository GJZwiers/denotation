import {
  assert,
  assertRejects,
} from "https://deno.land/std@0.136.0/testing/asserts.ts";
import { spawnProcess } from "./spawnProcess.ts";

Deno.test("should run a command in a sub process", async () => {
  const stdout = await spawnProcess("deno", ["--help"]);
  assert(stdout.length > 0);

  const content = new TextDecoder().decode(stdout).search(
    "A modern JavaScript and TypeScript runtime",
  );
  assert(content >= 0);
});

Deno.test("should throw if command exit status > 0", async () => {
  await assertRejects(async () => {
    await spawnProcess("deno", ["--hepl"]);
  });
});
