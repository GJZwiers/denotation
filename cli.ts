import { Command } from "./deps.ts";
import { main } from "./mod.ts";

export interface Options {
  prerelease?: true;
  filterNotes?: true;
}

await new Command()
  .name("denotation")
  .version("v0.4.6")
  .description("Create semantic releases based on conventional commit history.")
  .option(
    "--prerelease",
    "Sets whether or not the next version should be a pre-release",
  )
  .option(
    "--filter-notes",
    "Filters commits that are not related to the release from the notes (e.g. chore: and ci:)",
  )
  .action(async (options) => {
    if (options.prerelease) {
      console.warn("Warning: '--prerelease' is an experimental option.");
    }
    if (options.filterNotes) {
      console.warn("Warning: '--filter-notes' is an experimental option.");
    }

    await main(options);
  })
  .parse(Deno.args);
