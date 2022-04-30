export enum VersionIncrement {
  Major,
  Minor,
  Patch,
  Unconventional,
}

export function highestIncrement(
  prev: VersionIncrement,
  curr: VersionIncrement,
) {
  if (curr === VersionIncrement.Major || curr === prev) {
    return curr;
  }
  if (curr === VersionIncrement.Minor && prev === VersionIncrement.Patch) {
    return curr;
  }
  if (curr === VersionIncrement.Minor && prev === VersionIncrement.Major) {
    return prev;
  }
  if (curr === VersionIncrement.Patch && prev === VersionIncrement.Minor) {
    return prev;
  }
  if (curr === VersionIncrement.Patch && prev === VersionIncrement.Major) {
    return prev;
  }

  return curr;
}
