import { runCommands, yarnTask } from "./verifyRunner.mjs";

const lintTasks = [
  yarnTask("Line endings", ["check:line-endings"]),
  yarnTask("Prettier", ["prettier:ci"]),
  yarnTask("Biome", ["check:biome"]),
  yarnTask("Stylelint", ["lint:style"]),
  yarnTask("Source import policy", ["check:source-imports"]),
  yarnTask("Spellcheck", ["workspace", "@salt-ds/site", "spellcheck"]),
];

const groups = {
  lint: lintTasks,
  typecheck: [yarnTask("TypeScript", ["typecheck"])],
  unit: [yarnTask("Vitest", ["test", "--run"])],
  artifacts: [
    yarnTask("Package build", ["build"]),
    yarnTask("Published artifact smoke", ["check:published-artifacts"]),
  ],
};

function selectTasks(arguments_) {
  const groupIndex = arguments_.indexOf("--group");
  if (groupIndex !== -1) {
    const group = arguments_[groupIndex + 1];
    if (!groups[group]) {
      throw new Error(`Unknown verification group: ${group ?? "<missing>"}`);
    }
    return groups[group];
  }

  const baseTasks = [
    yarnTask("Immutable install", ["install", "--immutable"]),
    ...groups.lint,
    ...groups.typecheck,
    ...groups.unit,
  ];

  return arguments_.includes("--extended")
    ? [
        ...baseTasks,
        ...groups.artifacts,
        {
          ...yarnTask("Cypress components", ["test:components"]),
          env: { CI: "true" },
        },
      ]
    : baseTasks;
}

try {
  await runCommands(selectTasks(process.argv.slice(2)));
} catch (error) {
  console.error(`\n[verify] ${error.message}`);
  process.exitCode = 1;
}
