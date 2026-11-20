import { writeFileSync } from "node:fs";

export default class VitestBenchmarkReporter {
  modules = [];
  selected = [];

  onTestRunStart(specifications) {
    this.selected = specifications.map(
      (specification) => specification.moduleId,
    );
  }

  onTestModuleEnd(module) {
    this.modules.push({
      moduleId: module.moduleId,
      state: module.state(),
      diagnostic: module.diagnostic(),
    });
  }

  onTestRunEnd(_modules, errors, reason) {
    writeFileSync(
      process.env.SALT_BENCHMARK_DIAGNOSTICS,
      JSON.stringify(
        {
          selected: this.selected,
          modules: this.modules,
          errorCount: errors.length,
          reason,
        },
        null,
        2,
      ),
    );
  }
}
