/**
 * A warm TypeScript language service over a fixture project (salt-eval/fixtures/<name>).
 * Artifact files are virtual: they live under the fixture's `src/` for module resolution
 * but never touch disk. The program is reused across requests, so only the artifact and
 * whatever it newly imports are re-checked.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import type { Evidence } from "../protocol";

export interface TypecheckFinding {
  message: string;
  code: number;
  evidence: Evidence;
}

export class TypecheckService {
  readonly fixtureDir: string;
  private readonly options: ts.CompilerOptions;
  private readonly fixtureFiles: string[];
  private readonly virtual = new Map<
    string,
    { content: string; version: number }
  >();
  private readonly service: ts.LanguageService;

  constructor(fixtureDir: string, configName = "tsconfig.json") {
    this.fixtureDir = fixtureDir;
    const configPath = path.join(fixtureDir, configName);
    const parsed = ts.getParsedCommandLineOfConfigFile(
      configPath,
      {},
      {
        ...ts.sys,
        onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
          throw new Error(
            ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
          );
        },
      },
    );
    if (!parsed) throw new Error(`Could not read ${configPath}`);
    this.options = { ...parsed.options, noEmit: true };
    this.fixtureFiles = parsed.fileNames.map((f) => path.resolve(f));
    this.service = ts.createLanguageService(
      this.host(),
      ts.createDocumentRegistry(),
    );
  }

  private virtualPath(file: string): string {
    return path.resolve(this.fixtureDir, file);
  }

  private host(): ts.LanguageServiceHost {
    const virtual = this.virtual;
    const resolve = (file: string) => path.resolve(file);
    return {
      getCompilationSettings: () => this.options,
      getScriptFileNames: () => [...this.fixtureFiles, ...virtual.keys()],
      getScriptVersion: (file) =>
        String(virtual.get(resolve(file))?.version ?? 0),
      getScriptSnapshot: (file) => {
        const entry = virtual.get(resolve(file));
        if (entry) return ts.ScriptSnapshot.fromString(entry.content);
        if (!existsSync(file)) return undefined;
        return ts.ScriptSnapshot.fromString(ts.sys.readFile(file) ?? "");
      },
      getCurrentDirectory: () => this.fixtureDir,
      getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
      fileExists: (file) =>
        virtual.has(resolve(file)) || ts.sys.fileExists(file),
      readFile: (file, encoding) =>
        virtual.get(resolve(file))?.content ?? ts.sys.readFile(file, encoding),
      readDirectory: ts.sys.readDirectory,
      directoryExists: ts.sys.directoryExists,
      getDirectories: ts.sys.getDirectories,
      realpath: ts.sys.realpath,
    };
  }

  /** Replace the virtual artifact set and return diagnostics for those files only. */
  check(files: Record<string, string>): TypecheckFinding[] {
    const next = new Map<string, { content: string; version: number }>();
    for (const [file, content] of Object.entries(files)) {
      if (!/\.[cm]?[jt]sx?$/.test(file)) continue;
      const full = this.virtualPath(file);
      const previous = this.virtual.get(full);
      next.set(full, { content, version: (previous?.version ?? 0) + 1 });
    }
    this.virtual.clear();
    for (const [file, entry] of next) this.virtual.set(file, entry);

    const findings: TypecheckFinding[] = [];
    for (const full of this.virtual.keys()) {
      const diagnostics = [
        ...this.service.getSyntacticDiagnostics(full),
        ...this.service.getSemanticDiagnostics(full),
      ];
      for (const diagnostic of diagnostics) {
        findings.push(this.finding(diagnostic, full));
      }
    }
    return findings;
  }

  private finding(
    diagnostic: ts.Diagnostic,
    fallbackFile: string,
  ): TypecheckFinding {
    const message = ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      "\n",
    );
    const file = diagnostic.file?.fileName ?? fallbackFile;
    const evidence: Evidence = { file: path.relative(this.fixtureDir, file) };
    if (diagnostic.file && diagnostic.start !== undefined) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start,
      );
      evidence.line = line + 1;
      evidence.column = character + 1;
      evidence.text = diagnostic.file.text
        .slice(diagnostic.start, diagnostic.start + (diagnostic.length ?? 0))
        .slice(0, 200);
    }
    return {
      message: `TS${diagnostic.code}: ${message}`,
      code: diagnostic.code,
      evidence,
    };
  }
}
