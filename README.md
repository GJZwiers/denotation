# Denotation

[![deno module](https://shield.deno.dev/x/denotation)](https://deno.land/x/denotation)
![deno compatibility](https://shield.deno.dev/deno/^1.21)

`denotation` is a Deno script written for automatic semantic versioning, which
can run as part of an automated release process in a Continuous Integration (CI)
pipeline.

## Requirements

- `deno` 1.21 or higher
- `git`

## Usage

`deno run --allow-run=git --unstable https://deno.land/x/denotation@v0.2.0/mod.ts`

This will run the script and look at the commits made since the last git tag,
for example `v1.0.0`. Depending on the conventional commit messages it will
increment with either a patch (`v1.0.1`), minor version (`v1.1.0`) or major
version (`v2.0.0`). The new version is sent to `stdout` and can be used from
there.

The following example shows how to use `denotation` as a step in GitHub Actions
together with the GitHub CLI to make a release:

```yaml
name: release

on: workflow_dispatch

jobs:
  release:
    runs-on: ubuntu-20.04
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: denoland/setup-deno@v1.1.0
        with:
          deno-version: v1.x.x
      - run: deno run --allow-run='gh,git' --unstable https://deno.land/x/denotation@v0.2.0/mod.ts
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Contributing

You are welcome to report bugs, other issues, or make a feature request! If you
want to add a fix/feature/other improvement, fork this repository and make a
pull request with your changes.
