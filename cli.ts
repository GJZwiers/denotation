import { Command } from "./deps.ts";
import { main } from "./mod.ts";

export interface Options {
  prerelease?: true;
}

await new Command()
  .name("denotation")
  .version("v0.4.2")
  .description("Create semantic releases based on conventional commit history.")
  .option(
    "--prerelease",
    "Sets whether or not the next version should be a pre-release",
  )
  .action(async (options) => {
    if (options.prerelease) {
      console.warn("Warning: '--prerelease' is an experimental option.");
    }

    await main(options);
  })
  .parse(Deno.args);
