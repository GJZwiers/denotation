# Denotation

[![deno module](https://shield.deno.dev/x/denotation)](https://deno.land/x/denotation)
![deno compatibility](https://shield.deno.dev/deno/^1.21)

`denotation` is a tool for versioning and creating GitHub releases, which can
run as part of an automatic Continuous Integration & Continuous Delivery (CI/CD)
pipeline. The next semantic version is determined by
[conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) history.

## Requirements

- `deno` 1.21 or higher
- `git` and `gh` (available by default in GitHub Actions)

## Installation

The program can be invoked directly via URL or installed as a CLI. The default
name when installing is `denotation`, but a custom name can be chosen.

```
deno run --allow-run='gh,git' --unstable https://deno.land/x/denotation@v0.5.0/cli.ts -- --help
```

```
deno install --allow-run='gh,git' --unstable -n denote https://deno.land/x/denotation@v0.5.0/cli.ts
denote --help
```

## Usage

When the script runs it will look at the commits made since the last git tag,
for example `v1.0.0`. Depending on the conventional commit messages it will
increment with either a patch (`v1.0.1`), minor version (`v1.1.0`) or major
version (`v2.0.0`).

Here are some commit examples:

`fix: throw error on divide by zero` -> patch increment

`feat: look a new shiny object!` -> minor increment

`feat!: change parameter type number to string` -> major increment

`feat(myScope)!: change parameter type number to string` -> major increment

```
feat: change parameter type number to string

BREAKING CHANGE: existing calls to myFunction will need to be updated.
```

-> major increment

The following example shows how to use `denotation` as a step in GitHub Actions
to create a release:

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
      - run: deno run --allow-run='gh,git' --unstable https://deno.land/x/denotation@v0.5.0/cli.ts
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # GitHub Actions built-in variable.
```

At the moment Continuous Delivery is supported where a draft release is made
with generated release notes and some final edits can be made before publishing
to a module registry like `deno.land/x`.

## Pre-releases

Currently there is support for pre-releases with the suffix `-alpha.[version]`.
Use the `--prerelease` option to make the next release a pre-release.

If you are on `v1.0.0`, and you make a `fix:` commit for example, with
`--prerelease` the next version will become `v1.0.1-alpha.0`.

## Filter release notes

You can use `--filter-notes` to create custom release notes that don't contain
certain dev-only commits, such as `chore:`, `fix(ci)` and `build`. Only `fix`,
`feat` and `perf` commits will be kept in the release notes.

Currently this option is experimental.

## Roadmap

- Support Continuous Deployment, where release is immediate
- Support custom version increments based on commit scope like `feat(ci)`
  incrementing as a patch instead of a minor release.

## Contributing

You are welcome to report bugs, other issues, or make a feature request! If you
want to add a fix/feature/other improvement, fork this repository and make a
pull request with your changes.
