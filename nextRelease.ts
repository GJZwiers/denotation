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

    if (opts.next === ReleaseType.Release) {
      const suffix = ".0.0";
      nextVersion = `${groups.v}${(parseInt(groups.major) + 1).toString()}${suffix}`;
    }
    const suffix = (opts.next === ReleaseType.Release) ? ".0.0" : ".0.0-alpha.0";
    nextVersion = `${groups.v}${(parseInt(groups.major) + 1).toString()}${suffix}`;
  } else if (opts.increment === VersionIncrement.Minor) {
    const suffix = (opts.next === ReleaseType.Release) ? ".0" : ".0-alpha.0";
    nextVersion = `${groups.v}${groups.major}.${(parseInt(groups.minor) + 1).toString()}${suffix}`;
  } else if (opts.increment === VersionIncrement.Patch) {

      if (opts.next === ReleaseType.Prerelease && opts.current === ReleaseType.Prerelease) {
        const digit = groups.pre.match(/\d$/);
        if (!digit) {
          throw new Error("Error while matching prerelease digit");
        }
        const match = digit[0];
        nextVersion = `${groups.v}${groups.major}.${groups.minor}.${groups.patch}-alpha.${(parseInt(match) + 1).toString()}`;
      } else {
        const suffix = (parseInt(groups.patch) + 1).toString() + (opts.next === ReleaseType.Release ? "" : "-alpha.0")
        nextVersion = `${groups.v}${groups.major}.${groups.minor}.${suffix}`;
      }
    }

  return nextVersion;
}
