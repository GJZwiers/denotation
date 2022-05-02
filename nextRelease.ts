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

  if (opts.increment === VersionIncrement.Major) {
    if (
      opts.current === ReleaseType.Prerelease &&
      opts.next === ReleaseType.Release
    ) {
      nextVersion = `${groups.v}${groups.major}.0.0`;
    } else {
      groups.major = (parseInt(groups.major) + 1).toString();
      const suffix = (opts.next === ReleaseType.Release)
        ? ".0.0"
        : ".0.0-alpha.0";
      nextVersion = `${groups.v}${groups.major}${suffix}`;
    }
  } else if (opts.increment === VersionIncrement.Minor) {
    if (
      opts.current === ReleaseType.Prerelease &&
      opts.next === ReleaseType.Release
    ) {
      nextVersion = `${groups.v}${groups.major}.${groups.minor}.0`;
    } else {
      groups.minor = (parseInt(groups.minor) + 1).toString();
      const suffix = (opts.next === ReleaseType.Release) ? ".0" : ".0-alpha.0";
      nextVersion = `${groups.v}${groups.major}.${groups.minor}${suffix}`;
    }
  } else if (opts.increment === VersionIncrement.Patch) {
    if (opts.current === ReleaseType.Prerelease) {
      if (opts.next === ReleaseType.Release) {
        nextVersion =
          `${groups.v}${groups.major}.${groups.minor}.${groups.patch}`;
      } else {
        const match = groups.pre.match(/\d$/);
        if (!match) {
          throw new Error("Error while matching prerelease digit");
        }
        const prePatchNumber = match[0];
        nextVersion =
          `${groups.v}${groups.major}.${groups.minor}.${groups.patch}-alpha.${
            (parseInt(prePatchNumber) + 1).toString()
          }`;
      }
    } else {
      groups.patch = (parseInt(groups.patch) + 1).toString();
      const suffix = (opts.next === ReleaseType.Release) ? "" : "-alpha.0";
      nextVersion =
        `${groups.v}${groups.major}.${groups.minor}.${groups.patch}${suffix}`;
    }
  }

  return nextVersion;
}
