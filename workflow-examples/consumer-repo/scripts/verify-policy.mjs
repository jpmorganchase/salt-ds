import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const policy = JSON.parse(
  fs.readFileSync(path.join(root, ".salt", "team.json"), "utf8"),
);

const resolveLocalImport = (specifier) => {
  assert.match(specifier, /^@\//, `Unsupported local import: ${specifier}`);
  const base = path.join(root, "src", specifier.slice(2));
  const match = [".tsx", ".ts", ".jsx", ".js"].find((extension) =>
    fs.existsSync(`${base}${extension}`),
  );
  assert.ok(match, `Policy import does not resolve: ${specifier}`);
  return `${base}${match}`;
};

const wrappers = new Set();
for (const wrapper of policy.approved_wrappers ?? []) {
  const source = fs.readFileSync(resolveLocalImport(wrapper.import.from), "utf8");
  assert.match(
    source,
    new RegExp(`\\b${wrapper.import.name}\\b`),
    `Wrapper export is missing: ${wrapper.import.name}`,
  );
  wrappers.add(wrapper.name);
}

for (const preference of policy.preferred_components ?? []) {
  assert.ok(
    wrappers.has(preference.prefer),
    `Preferred component has no implemented approved wrapper: ${preference.prefer}`,
  );
}

const theme = policy.theme_defaults;
if (theme) {
  const providerSource = fs.readFileSync(
    resolveLocalImport(theme.provider_import.from),
    "utf8",
  );
  assert.match(
    providerSource,
    new RegExp(`\\b${theme.provider_import.name}\\b`),
    `Theme provider export is missing: ${theme.provider_import.name}`,
  );
  for (const cssImport of theme.imports ?? []) {
    const implementedImport = cssImport.startsWith("@/theme/")
      ? `./${path.basename(cssImport)}`
      : cssImport;
    assert.ok(
      providerSource.includes(`"${implementedImport}"`),
      `Theme CSS import is not implemented by ${theme.provider}: ${cssImport}`,
    );
  }
  for (const prop of theme.props ?? []) {
    assert.ok(
      providerSource.includes(`${prop.name}="${prop.value}"`),
      `Theme default is not implemented by ${theme.provider}: ${prop.name}`,
    );
  }
}

console.log("Verified consumer fixture policy implementation.");
