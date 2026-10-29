function parseSemver(version) {
  const match = version.match(
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/,
  );

  if (!match) {
    throw new Error(`Invalid semantic version: ${version}`);
  }

  return {
    core: match.slice(1, 4).map(Number),
    prerelease: match[4]?.split(".") ?? [],
  };
}

export function compareSemver(leftVersion, rightVersion) {
  const left = parseSemver(leftVersion);
  const right = parseSemver(rightVersion);

  for (let index = 0; index < left.core.length; index++) {
    if (left.core[index] !== right.core[index]) {
      return left.core[index] - right.core[index];
    }
  }

  if (left.prerelease.length === 0 || right.prerelease.length === 0) {
    return right.prerelease.length - left.prerelease.length;
  }

  const length = Math.max(left.prerelease.length, right.prerelease.length);
  for (let index = 0; index < length; index++) {
    const leftPart = left.prerelease[index];
    const rightPart = right.prerelease[index];

    if (leftPart == null || rightPart == null) {
      return leftPart == null ? -1 : 1;
    }

    if (leftPart === rightPart) {
      continue;
    }

    const leftIsNumber = /^\d+$/.test(leftPart);
    const rightIsNumber = /^\d+$/.test(rightPart);
    if (leftIsNumber && rightIsNumber) {
      return Number(leftPart) - Number(rightPart);
    }
    if (leftIsNumber !== rightIsNumber) {
      return leftIsNumber ? -1 : 1;
    }

    return leftPart < rightPart ? -1 : 1;
  }

  return 0;
}
