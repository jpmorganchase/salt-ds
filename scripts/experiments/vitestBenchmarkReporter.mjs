import { writeFileSync } from "node:fs";
import { env } from "node:process";

export default class VitestBenchmarkReporter {
  modules = [];
  selected = [];

  onInit() {
    if (!env.SALT_BENCHMARK_DIAGNOSTICS) {
      throw new Error("SALT_BENCHMARK_DIAGNOSTICS must name the output file");
    }
  }

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
      env.SALT_BENCHMARK_DIAGNOSTICS,
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
