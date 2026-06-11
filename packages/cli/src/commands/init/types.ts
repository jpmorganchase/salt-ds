import type { SaltAiSetupSummary } from "@salt-ds/semantic-core";
import type { SaltInfoResult } from "../../types.js";

export interface InitWorkflowResult {
  workflow: "init";
  rootDir: string;
  projectName: string;
  context: SaltInfoResult;
  policy: {
    path: string | null;
    action: "created" | "unchanged" | "skipped-layered";
    mode: SaltInfoResult["policy"]["mode"];
  };
  stack: {
    path: string | null;
    action: "created" | "unchanged" | "not_requested";
    conventionsPackSource: string | null;
  };
  repoInstructions: {
    path: string;
    filename: "AGENTS.md" | "CLAUDE.md" | null;
    action: "created" | "updated" | "unchanged";
  };
  agentHooks: {
    path: string | null;
    action: "created" | "updated" | "unchanged" | "not_requested";
  };
  summary: {
    readyForCreate: boolean;
    nextStep: string;
  };
  notes: string[];
  aiSetup?: SaltAiSetupSummary | null;
}
