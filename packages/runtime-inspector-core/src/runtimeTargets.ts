export interface RuntimeTargetPackageJsonLike {
  scripts?: Record<string, string>;
}

export interface DetectedRuntimeTarget {
  label: "storybook" | "app-runtime";
  url: string;
  source: "detected-script" | "detected-default";
}

const DEFAULT_RUNTIME_PORTS = {
  storybook: 6006,
  "app-runtime": 3000,
} as const;

function normalizeHost(value: string | null): string {
  if (!value || value === "0.0.0.0" || value === "::") {
    return "localhost";
  }

  return value;
}

function extractPort(script: string | null | undefined): number | null {
  if (!script) {
    return null;
  }

  const patterns = [
    /(?:^|\s)--port(?:=|\s+)(\d{2,5})(?:\s|$)/i,
    /(?:^|\s)-p\s*(\d{2,5})(?:\s|$)/i,
    /(?:^|\s)PORT=(\d{2,5})(?:\s|$)/i,
  ];

  for (const pattern of patterns) {
    const match = script.match(pattern);
    if (match?.[1]) {
      const parsed = Number.parseInt(match[1], 10);
      if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }

  return null;
}

function extractHost(script: string | null | undefined): string | null {
  if (!script) {
    return null;
  }

  const match =
    script.match(/(?:^|\s)--host(?:=|\s+)([^\s]+)/i) ??
    script.match(/(?:^|\s)HOST=([^\s]+)/i);

  return match?.[1] ?? null;
}

function toTargetUrl(port: number, host: string | null): string {
  return `http://${normalizeHost(host)}:${port}/`;
}

function readScript(
  packageJson: RuntimeTargetPackageJsonLike | null | undefined,
  scriptNames: string[],
): string | null {
  for (const scriptName of scriptNames) {
    const script = packageJson?.scripts?.[scriptName];
    if (typeof script === "string" && script.trim().length > 0) {
      return script.trim();
    }
  }

  return null;
}

function detectTargetFromScript(input: {
  packageJson: RuntimeTargetPackageJsonLike | null | undefined;
  label: DetectedRuntimeTarget["label"];
  scriptNames: string[];
}): DetectedRuntimeTarget | null {
  const script = readScript(input.packageJson, input.scriptNames);
  const detectedPort = extractPort(script);
  if (!script || !detectedPort) {
    return null;
  }

  return {
    label: input.label,
    url: toTargetUrl(detectedPort, extractHost(script)),
    source: "detected-script",
  };
}

export function detectLocalRuntimeTargets(input: {
  packageJson: RuntimeTargetPackageJsonLike | null | undefined;
  storybookDetected: boolean;
  appRuntimeDetected: boolean;
}): DetectedRuntimeTarget[] {
  const detected: DetectedRuntimeTarget[] = [];
  const storybookTarget = input.storybookDetected
    ? detectTargetFromScript({
        packageJson: input.packageJson,
        label: "storybook",
        scriptNames: ["storybook", "start-storybook"],
      })
    : null;
  const appTarget = input.appRuntimeDetected
    ? detectTargetFromScript({
        packageJson: input.packageJson,
        label: "app-runtime",
        scriptNames: ["dev", "start"],
      })
    : null;

  if (storybookTarget) {
    detected.push(storybookTarget);
  } else if (input.storybookDetected) {
    detected.push({
      label: "storybook",
      url: toTargetUrl(DEFAULT_RUNTIME_PORTS.storybook, null),
      source: "detected-default",
    });
  }

  if (appTarget) {
    detected.push(appTarget);
  } else if (input.appRuntimeDetected) {
    detected.push({
      label: "app-runtime",
      url: toTargetUrl(DEFAULT_RUNTIME_PORTS["app-runtime"], null),
      source: "detected-default",
    });
  }

  return detected;
}
