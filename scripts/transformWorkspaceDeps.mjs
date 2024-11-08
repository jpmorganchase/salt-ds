export async function transformWorkspaceDeps(dependencies = {}) {
  const workspacePackages = Object.entries(dependencies).filter(([, version]) =>
    version.match(/^workspace:/),
  );

  const workspaceDependencies = {};

  for (const [name, version] of workspacePackages) {
    // strip workspace:
    const strippedVersion = version.slice(10);

    if (
      strippedVersion !== "~" &&
      strippedVersion !== "*" &&
      strippedVersion !== "^"
    ) {
      workspaceDependencies[name] = strippedVersion;
      continue;
    }

    const packageJson = (
      await import(`${name}/package.json`, {
        with: { type: "json" },
      })
    ).default;

    workspaceDependencies[name] =
      `${strippedVersion !== "*" ? strippedVersion : ""}${packageJson.version}`;
  }

  return {
    ...dependencies,
    ...workspaceDependencies,
  };
}
