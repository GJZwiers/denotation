/** Wrapper around Deno.Command with some error handling. */
export async function spawnProcess(
  command: string,
  args: string[],
): Promise<Uint8Array> {
  const cmd = new Deno.Command(command, {
    args: args,
  });
  cmd.spawn();

  const { code, stdout, stderr } = await cmd.output();

  if (code > 0) {
    const err = new TextDecoder().decode(stderr);
    throw new Error(`${command} failed: ${err}`);
  }

  return stdout;
}
