/**
 * Grade one request. Expensive collaborators (registry, typecheckers, Biome) live in a
 * long-lived Environment so `--serve` pays for them once.
 */
import path from "node:path";
import { analyzeFiles } from "./analysis/jsx";
import { CHECKS } from "./checks";
import type { GradeContext } from "./checks/context";
import { Biome } from "./lint/biome";
import type { CheckResult, GraderRequest, GraderResult } from "./protocol";
import { loadRegistry, type Registry } from "./registry/build";
import { TypecheckService } from "./typecheck/service";

export interface EnvironmentOptions {
  repoRoot: string;
  fixturesDir: string;
  cacheDir: string;
  saltTypes: "src" | "dist";
}

export class Environment {
  readonly options: EnvironmentOptions;
  private registryCache: Registry | null = null;
  private biomeCache: Biome | null = null;
  private readonly typecheckers = new Map<string, TypecheckService>();

  constructor(options: EnvironmentOptions) {
    this.options = options;
  }

  registry(): Registry {
    this.registryCache ??= loadRegistry(
      this.options.repoRoot,
      this.options.cacheDir,
    );
    return this.registryCache;
  }

  biome(): Biome {
    this.biomeCache ??= new Biome();
    return this.biomeCache;
  }

  typecheck(fixture: string): TypecheckService {
    let service = this.typecheckers.get(fixture);
    if (!service) {
      const configName =
        this.options.saltTypes === "dist"
          ? "tsconfig.dist.json"
          : "tsconfig.json";
      service = new TypecheckService(
        path.join(this.options.fixturesDir, fixture),
        configName,
      );
      this.typecheckers.set(fixture, service);
    }
    return service;
  }

  context(request: GraderRequest): GradeContext {
    let analyses: ReturnType<typeof analyzeFiles> | null = null;
    return {
      files: request.files,
      fixture: request.fixture,
      analyses: () => {
        analyses ??= analyzeFiles(request.files);
        return analyses;
      },
      registry: () => this.registry(),
      typecheck: () => this.typecheck(request.fixture),
      biome: () => this.biome(),
    };
  }
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function gradeRequest(
  request: GraderRequest,
  environment: Environment,
): GraderResult {
  const context = environment.context(request);
  const results: CheckResult[] = request.checks.map((check) => {
    const definition = CHECKS[check.grader];
    try {
      const params = definition.parse(check.params);
      return { id: check.id, ...definition.run(context, params) };
    } catch (error) {
      return {
        id: check.id,
        verdict: "error",
        diagnostics: [`${check.grader} failed: ${message(error)}`],
        evidence: [],
      };
    }
  });
  return { id: request.id, results };
}
