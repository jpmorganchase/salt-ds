import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const expectedManualStatuses = new Set([
  "not-tested",
  "passed",
  "failed",
  "blocked",
]);
const expectedComponentStatuses = new Set([
  "target",
  "tested",
  "supported",
  "exception",
]);
const expectedAutomatedKinds = new Set(["axe", "behavior", "keyboard"]);
const maximumReviewIntervalDays = 93;

function isDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/u.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
  );
}

function daysBetween(start, end) {
  return (
    (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) /
    86_400_000
  );
}

function requireText(value, label, errors) {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${label} must be a non-empty string`);
  }
}

export function validateAccessibilityEvidence(
  manifest,
  {
    rootDirectory = process.cwd(),
    today = new Date().toISOString().slice(0, 10),
    pathExists = (relativePath) =>
      fs.existsSync(path.resolve(rootDirectory, relativePath)),
  } = {},
) {
  const errors = [];

  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    return ["manifest must be an object"];
  }
  if (manifest.$schema !== "./component-evidence.schema.json") {
    errors.push('$schema must reference "./component-evidence.schema.json"');
  }
  if (manifest.schemaVersion !== 1) {
    errors.push("schemaVersion must be 1");
  }
  if (manifest.conformanceTarget !== "WCAG 2.2 Level AA") {
    errors.push('conformanceTarget must be "WCAG 2.2 Level AA"');
  }
  requireText(manifest.publicDocumentation, "publicDocumentation", errors);
  if (
    typeof manifest.publicDocumentation === "string" &&
    !pathExists(manifest.publicDocumentation)
  ) {
    errors.push(
      `publicDocumentation does not exist: ${manifest.publicDocumentation}`,
    );
  }

  const matrix = Array.isArray(manifest.supportMatrix)
    ? manifest.supportMatrix
    : [];
  if (matrix.length === 0) {
    errors.push("supportMatrix must contain at least one combination");
  }
  const matrixIds = new Set();
  for (const [index, combination] of matrix.entries()) {
    const label = `supportMatrix[${index}]`;
    requireText(combination?.id, `${label}.id`, errors);
    requireText(
      combination?.operatingSystem,
      `${label}.operatingSystem`,
      errors,
    );
    requireText(combination?.browser, `${label}.browser`, errors);
    requireText(
      combination?.assistiveTechnology,
      `${label}.assistiveTechnology`,
      errors,
    );
    if (matrixIds.has(combination?.id)) {
      errors.push(`${label}.id duplicates ${combination.id}`);
    }
    matrixIds.add(combination?.id);
  }

  const components = Array.isArray(manifest.components)
    ? manifest.components
    : [];
  if (components.length < 3 || components.length > 5) {
    errors.push("components must contain between 3 and 5 pilot components");
  }
  const componentIds = new Set();

  for (const [index, component] of components.entries()) {
    const label = `components[${index}]`;
    requireText(component?.id, `${label}.id`, errors);
    requireText(component?.name, `${label}.name`, errors);
    requireText(component?.owner, `${label}.owner`, errors);
    requireText(component?.documentation, `${label}.documentation`, errors);
    if (componentIds.has(component?.id)) {
      errors.push(`${label}.id duplicates ${component.id}`);
    }
    componentIds.add(component?.id);

    if (component?.package !== "@salt-ds/core") {
      errors.push(`${label}.package must be @salt-ds/core`);
    }
    if (!expectedComponentStatuses.has(component?.status)) {
      errors.push(`${label}.status is not part of the evidence vocabulary`);
    }
    if (component?.formallyConformant !== false) {
      errors.push(
        `${label}.formallyConformant must remain false without a formal assessment`,
      );
    }
    if (!isDate(component?.reviewedOn)) {
      errors.push(`${label}.reviewedOn must be an ISO date`);
    } else if (component.reviewedOn > today) {
      errors.push(`${label}.reviewedOn must not be in the future`);
    }
    if (!isDate(component?.reviewBy)) {
      errors.push(`${label}.reviewBy must be an ISO date`);
    } else if (component.reviewBy < today) {
      errors.push(
        `${label}.reviewBy (${component.reviewBy}) is stale as of ${today}`,
      );
    }
    if (
      isDate(component?.reviewedOn) &&
      isDate(component?.reviewBy) &&
      component.reviewedOn > component.reviewBy
    ) {
      errors.push(`${label}.reviewedOn must not be after reviewBy`);
    } else if (
      isDate(component?.reviewedOn) &&
      isDate(component?.reviewBy) &&
      daysBetween(component.reviewedOn, component.reviewBy) >
        maximumReviewIntervalDays
    ) {
      errors.push(`${label}.reviewBy must be within 93 days of reviewedOn`);
    }
    if (component?.documentation?.includes("packages/lab/")) {
      errors.push(`${label}.documentation must not reference lab`);
    } else if (
      typeof component?.documentation === "string" &&
      !pathExists(component.documentation)
    ) {
      errors.push(
        `${label}.documentation does not exist: ${component.documentation}`,
      );
    }

    const automatedEvidence = Array.isArray(component?.automatedEvidence)
      ? component.automatedEvidence
      : [];
    if (automatedEvidence.length === 0) {
      errors.push(`${label}.automatedEvidence must not be empty`);
    }
    const evidenceIds = new Set();
    for (const [evidenceIndex, evidence] of automatedEvidence.entries()) {
      const evidenceLabel = `${label}.automatedEvidence[${evidenceIndex}]`;
      requireText(evidence?.id, `${evidenceLabel}.id`, errors);
      requireText(evidence?.kind, `${evidenceLabel}.kind`, errors);
      requireText(evidence?.path, `${evidenceLabel}.path`, errors);
      requireText(evidence?.covers, `${evidenceLabel}.covers`, errors);
      requireText(evidence?.command, `${evidenceLabel}.command`, errors);
      if (evidenceIds.has(evidence?.id)) {
        errors.push(`${evidenceLabel}.id duplicates ${evidence.id}`);
      }
      evidenceIds.add(evidence?.id);
      if (!expectedAutomatedKinds.has(evidence?.kind)) {
        errors.push(`${evidenceLabel}.kind is invalid`);
      }
      if (evidence?.status !== "passed" && evidence?.status !== "failed") {
        errors.push(`${evidenceLabel}.status is invalid`);
      }
      if (!isDate(evidence?.recordedOn)) {
        errors.push(`${evidenceLabel}.recordedOn must be an ISO date`);
      } else if (evidence.recordedOn > today) {
        errors.push(`${evidenceLabel}.recordedOn must not be in the future`);
      } else if (
        isDate(component?.reviewedOn) &&
        evidence.recordedOn < component.reviewedOn
      ) {
        errors.push(
          `${evidenceLabel}.recordedOn must be within the active component review window`,
        );
      }
      if (evidence?.path?.includes("packages/lab/")) {
        errors.push(`${evidenceLabel}.path must not reference lab`);
      } else if (
        typeof evidence?.path === "string" &&
        !pathExists(evidence.path)
      ) {
        errors.push(`${evidenceLabel}.path does not exist: ${evidence.path}`);
      }
    }

    if (
      (component?.status === "tested" || component?.status === "supported") &&
      automatedEvidence.some((evidence) => evidence.status !== "passed")
    ) {
      errors.push(
        `${label}.status ${component.status} requires passed automated evidence`,
      );
    }

    const criteria = Array.isArray(component?.successCriteria)
      ? component.successCriteria
      : [];
    if (criteria.length === 0) {
      errors.push(`${label}.successCriteria must not be empty`);
    }
    for (const [criterionIndex, criterion] of criteria.entries()) {
      const criterionLabel = `${label}.successCriteria[${criterionIndex}]`;
      if (!/^[1-4]\.\d+\.\d+$/u.test(criterion?.criterion ?? "")) {
        errors.push(
          `${criterionLabel}.criterion must be a WCAG criterion number`,
        );
      }
      if (criterion?.level !== "A" && criterion?.level !== "AA") {
        errors.push(`${criterionLabel}.level must be A or AA`);
      }
      if (
        !Array.isArray(criterion?.evidenceIds) ||
        criterion.evidenceIds.length === 0
      ) {
        errors.push(`${criterionLabel}.evidenceIds must not be empty`);
      } else {
        for (const evidenceId of criterion.evidenceIds) {
          if (!evidenceIds.has(evidenceId)) {
            errors.push(
              `${criterionLabel}.evidenceIds references unknown evidence ${evidenceId}`,
            );
          }
        }
      }
    }

    const manualEvidence = Array.isArray(component?.manualEvidence)
      ? component.manualEvidence
      : [];
    const manualMatrixIds = new Set();
    for (const [manualIndex, evidence] of manualEvidence.entries()) {
      const manualLabel = `${label}.manualEvidence[${manualIndex}]`;
      if (!matrixIds.has(evidence?.matrixId)) {
        errors.push(`${manualLabel}.matrixId is not in supportMatrix`);
      }
      if (manualMatrixIds.has(evidence?.matrixId)) {
        errors.push(`${manualLabel}.matrixId duplicates ${evidence.matrixId}`);
      }
      manualMatrixIds.add(evidence?.matrixId);
      if (!expectedManualStatuses.has(evidence?.status)) {
        errors.push(`${manualLabel}.status is invalid`);
      }
      if (
        !Array.isArray(evidence?.scenarios) ||
        evidence.scenarios.length === 0
      ) {
        errors.push(`${manualLabel}.scenarios must not be empty`);
      }
      if (evidence?.status === "not-tested" && evidence?.recordedOn !== null) {
        errors.push(`${manualLabel}.recordedOn must be null when not tested`);
      }
      if (evidence?.status !== "not-tested" && !isDate(evidence?.recordedOn)) {
        errors.push(
          `${manualLabel}.recordedOn must be an ISO date after testing`,
        );
      } else if (
        evidence?.status !== "not-tested" &&
        evidence.recordedOn > today
      ) {
        errors.push(`${manualLabel}.recordedOn must not be in the future`);
      } else if (
        evidence?.status !== "not-tested" &&
        isDate(component?.reviewedOn) &&
        evidence.recordedOn < component.reviewedOn
      ) {
        errors.push(
          `${manualLabel}.recordedOn must be within the active component review window`,
        );
      }
    }
    for (const matrixId of matrixIds) {
      if (!manualMatrixIds.has(matrixId)) {
        errors.push(`${label}.manualEvidence is missing ${matrixId}`);
      }
    }

    if (
      component?.status === "supported" &&
      (manualEvidence.length !== matrixIds.size ||
        manualEvidence.some((evidence) => evidence.status !== "passed"))
    ) {
      errors.push(
        `${label}.status supported requires a current passed manual result for every supportMatrix entry`,
      );
    }

    const exceptions = Array.isArray(component?.exceptions)
      ? component.exceptions
      : [];
    if (!Array.isArray(component?.exceptions)) {
      errors.push(`${label}.exceptions must be an array`);
    }
    if (
      component?.status === "exception" &&
      !exceptions.some((exception) => exception?.status !== "resolved")
    ) {
      errors.push(
        `${label}.status exception requires an active exception record`,
      );
    }
    for (const [exceptionIndex, exception] of exceptions.entries()) {
      const exceptionLabel = `${label}.exceptions[${exceptionIndex}]`;
      requireText(exception?.id, `${exceptionLabel}.id`, errors);
      requireText(exception?.impact, `${exceptionLabel}.impact`, errors);
      requireText(exception?.owner, `${exceptionLabel}.owner`, errors);
      if (
        !Array.isArray(exception?.successCriteria) ||
        exception.successCriteria.length === 0 ||
        exception.successCriteria.some(
          (criterion) => !/^[1-4]\.\d+\.\d+$/u.test(criterion),
        )
      ) {
        errors.push(
          `${exceptionLabel}.successCriteria must contain WCAG criterion numbers`,
        );
      }
      if (!["open", "accepted", "resolved"].includes(exception?.status)) {
        errors.push(`${exceptionLabel}.status is invalid`);
      }
      if (!isDate(exception?.reviewBy)) {
        errors.push(`${exceptionLabel}.reviewBy must be an ISO date`);
      } else if (
        exception.status !== "resolved" &&
        exception.reviewBy < today
      ) {
        errors.push(
          `${exceptionLabel}.reviewBy (${exception.reviewBy}) is stale as of ${today}`,
        );
      } else if (
        isDate(component?.reviewBy) &&
        exception.reviewBy > component.reviewBy
      ) {
        errors.push(
          `${exceptionLabel}.reviewBy must not be after the component reviewBy`,
        );
      }
    }
    if (
      !Array.isArray(component?.limitations) ||
      component.limitations.length === 0
    ) {
      errors.push(`${label}.limitations must not be empty`);
    }
  }

  return errors;
}

export function checkAccessibilityEvidence({
  rootDirectory = process.cwd(),
} = {}) {
  const schemaPath = path.join(
    rootDirectory,
    "accessibility",
    "component-evidence.schema.json",
  );
  const manifestPath = path.join(
    rootDirectory,
    "accessibility",
    "component-evidence.json",
  );
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (schema?.properties?.schemaVersion?.const !== manifest.schemaVersion) {
    throw new Error(
      "Accessibility evidence schema version does not match manifest",
    );
  }
  const errors = validateAccessibilityEvidence(manifest, { rootDirectory });
  if (errors.length > 0) {
    throw new Error(
      `Accessibility evidence is invalid:\n- ${errors.join("\n- ")}`,
    );
  }
  console.log(
    `Accessibility evidence is current for ${manifest.components.length} pilot components.`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    checkAccessibilityEvidence();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
