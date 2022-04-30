/** Wrapper around Deno.spawn with some error handling. */
export async function spawnProcess(
  command: string,
  args: string[],
): Promise<Uint8Array> {
  const { status, stdout, stderr } = await Deno.spawn(command, {
    args: args,
  });

  if (!status.success) {
    const err = new TextDecoder().decode(stderr);
    throw new Error(`${command} failed: ${err}`);
  }

  return stdout;
}
