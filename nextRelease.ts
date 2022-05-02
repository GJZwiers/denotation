import { VersionIncrement } from "./incrementVersion.ts";

export enum ReleaseType {
  Release,
  Prerelease,
}

export interface NextReleaseOptions {
  current: ReleaseType;
  next: ReleaseType;
  increment: VersionIncrement;
}

export function nextRelease(
  groups: { [key: string]: string },
  opts: NextReleaseOptions,
) {
  let nextVersion;

  if (
    opts.current === ReleaseType.Release &&
    opts.next === ReleaseType.Prerelease
  ) {
    if (opts.increment === VersionIncrement.Patch) {
      nextVersion = `${groups.v}${groups.major}.${groups.minor}.${
        (parseInt(groups.patch) + 1).toString()
      }-alpha.0`;
    } else if (opts.increment === VersionIncrement.Minor) {
      nextVersion = `${groups.v}${groups.major}.${
        (parseInt(groups.minor) + 1).toString()
      }.0-alpha.0`;
    } else if (opts.increment === VersionIncrement.Major) {
      nextVersion = `${groups.v}${groups.major = (parseInt(groups.major) + 1)
        .toString()}.0.0-alpha.0`;
    }
  } else if (
    opts.current === ReleaseType.Prerelease &&
    opts.next === ReleaseType.Prerelease
  ) {
    const digit = groups.pre.match(/\d$/); // -alpha.0
    if (!digit) {
      throw new Error("Error while matching prerelease digit");
    }
    const match = digit[0];

    if (opts.increment === VersionIncrement.Patch) {
      nextVersion =
        `${groups.v}${groups.major}.${groups.minor}.${groups.patch}-alpha.${
          (parseInt(match) + 1).toString() // -alpha.1
        }`;
    } else if (opts.increment === VersionIncrement.Minor) {
      nextVersion = `${groups.v}${groups.major}.${
        (parseInt(groups.minor) + 1).toString()
      }.0-alpha.0`;
    } else if (opts.increment === VersionIncrement.Major) {
      nextVersion = `${groups.v}${
        (parseInt(groups.major) + 1).toString()
      }.0.0-alpha.0`;
    }
  } else if (
    opts.current === ReleaseType.Prerelease && opts.next === ReleaseType.Release
  ) {
    if (opts.increment === VersionIncrement.Patch) {
      nextVersion =
        `${groups.v}${groups.major}.${groups.minor}.${groups.patch}`;
    } else if (opts.increment === VersionIncrement.Minor) {
      nextVersion = `${groups.v}${groups.major}.${groups.minor}.0`;
    } else if (opts.increment === VersionIncrement.Major) {
      nextVersion = `${groups.v}${groups.major}.0.0`;
    }
  } else {
    if (opts.increment === VersionIncrement.Patch) {
      nextVersion = `${groups.v}${groups.major}.${groups.minor}.${
        (parseInt(groups.patch) + 1).toString()
      }`;
    } else if (opts.increment === VersionIncrement.Minor) {
      nextVersion = `${groups.v}${groups.major}.${
        (parseInt(groups.minor) + 1).toString()
      }.0`;
    } else if (opts.increment === VersionIncrement.Major) {
      nextVersion = `${groups.v}${(parseInt(groups.major) + 1).toString()}.0.0`;
    }
  }

  return nextVersion;
}
