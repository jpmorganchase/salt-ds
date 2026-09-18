import path from "node:path";
import { readBoundedProjectFile } from "../project/boundedProjectFile.js";

export interface DetectedProjectPolicy {
  teamConfigPath: string | null;
  stackConfigPath: string | null;
  mode: "none" | "team" | "stack";
  markerIssues: Array<"team_marker_invalid" | "stack_marker_invalid">;
}

export async function detectProjectPolicy(
  rootDir: string,
  authorityRoot: string = rootDir,
): Promise<DetectedProjectPolicy> {
  const teamConfigPath = path.join(rootDir, ".salt", "team.json");
  const stackConfigPath = path.join(rootDir, ".salt", "stack.json");
  const [teamMarker, stackMarker] = await Promise.all([
    readBoundedProjectFile({
      authorityRoot,
      rootDir,
      filePath: teamConfigPath,
      maxUtf8Bytes: 512 * 1024,
    }),
    readBoundedProjectFile({
      authorityRoot,
      rootDir,
      filePath: stackConfigPath,
      maxUtf8Bytes: 512 * 1024,
    }),
  ]);
  const resolvedTeamConfigPath =
    teamMarker.status === "absent" ? null : teamMarker.path;
  const resolvedStackConfigPath =
    stackMarker.status === "absent" ? null : stackMarker.path;

  return {
    teamConfigPath: resolvedTeamConfigPath,
    stackConfigPath: resolvedStackConfigPath,
    mode: resolvedStackConfigPath
      ? "stack"
      : resolvedTeamConfigPath
        ? "team"
        : "none",
    markerIssues: [
      ...(teamMarker.status === "invalid"
        ? (["team_marker_invalid"] as const)
        : []),
      ...(stackMarker.status === "invalid"
        ? (["stack_marker_invalid"] as const)
        : []),
    ],
  };
}
