function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(value, label) {
  if (!isRecord(value)) {
    throw new Error(`Catalog published schema is missing ${label}.`);
  }
  return value;
}

function assertClosedTupleSchemas(value, path = "schema") {
  if (Array.isArray(value)) {
    for (const [index, nested] of value.entries()) {
      assertClosedTupleSchemas(nested, `${path}/${index}`);
    }
    return;
  }
  if (!isRecord(value)) return;
  if (Array.isArray(value.prefixItems)) {
    const length = value.prefixItems.length;
    if (
      value.minItems !== length ||
      value.maxItems !== length ||
      value.items !== false
    ) {
      throw new Error(
        `Catalog published tuple ${path} is not closed to exactly ${length} item(s).`,
      );
    }
  }
  for (const [key, nested] of Object.entries(value)) {
    assertClosedTupleSchemas(nested, `${path}/${key}`);
  }
}

export function assertCatalogPublishedSchemaContract(catalogSchema) {
  assertClosedTupleSchemas(catalogSchema);
  const definitions = requireRecord(catalogSchema?.definitions, "definitions");
  const apiSymbol = requireRecord(definitions.api_symbol, "api_symbol");
  const apiProperties = requireRecord(
    apiSymbol.properties,
    "api_symbol properties",
  );
  const entrypointSchema = requireRecord(
    apiProperties.entrypoint,
    "api_symbol entrypoint",
  );
  const contentDefinitions = requireRecord(
    catalogSchema?.content_definitions,
    "content definitions",
  );
  const componentDetail = requireRecord(
    contentDefinitions.component_detail,
    "component_detail",
  );
  const componentProperties = requireRecord(
    componentDetail.properties,
    "component_detail properties",
  );
  const propSubjects = requireRecord(
    componentProperties.prop_subjects,
    "component_detail prop_subjects",
  );
  const propSubjectSchema = requireRecord(
    propSubjects.items,
    "component prop subject",
  );

  const propSubjectProperties = requireRecord(
    propSubjectSchema.properties,
    "component prop subject properties",
  );
  const propSubjectEntrypointSchema = requireRecord(
    propSubjectProperties.entrypoint,
    "component prop subject entrypoint",
  );
  const validEntrypoints = [".", "./moment", "./nested/subpath"];
  const invalidEntrypoints = [
    "",
    "moment",
    "../x",
    "./../x",
    "./a/../x",
    "./a//x",
    "./a/",
    "./a\\b",
    "./a:b",
    "./CON",
    "./prn.txt",
    "./com1/subpath",
    "./nested/LPT9.log",
    "./trailing ",
    "./control\u0001",
  ];
  for (const [label, schema] of [
    ["api symbol", entrypointSchema],
    ["component prop subject", propSubjectEntrypointSchema],
  ]) {
    if (schema.type !== "string" || typeof schema.pattern !== "string") {
      throw new Error(
        `Catalog published ${label} entrypoint is not a pattern-constrained string.`,
      );
    }
    const pattern = new RegExp(schema.pattern, "u");
    for (const value of validEntrypoints) {
      if (!pattern.test(value)) {
        throw new Error(
          `Catalog published ${label} entrypoint schema rejected valid value '${value}'.`,
        );
      }
    }
    for (const value of invalidEntrypoints) {
      if (pattern.test(value)) {
        throw new Error(
          `Catalog published ${label} entrypoint schema accepted invalid value '${value}'.`,
        );
      }
    }
  }
}

function compareOrdinalStrings(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function assertTupleStorageDescriptor(storage) {
  if (
    !Array.isArray(storage.fields) ||
    storage.fields.length === 0 ||
    storage.fields.some(
      (field) => typeof field !== "string" || field.length === 0,
    ) ||
    new Set(storage.fields).size !== storage.fields.length
  ) {
    throw new Error(
      "Catalog tuple storage must declare unique, non-empty field names.",
    );
  }
}

function countDerivedTargetGroups(records) {
  let logicalCount = 0;
  let previousFamily = null;

  for (const group of records) {
    if (
      !Array.isArray(group) ||
      group.length !== 2 ||
      typeof group[0] !== "string" ||
      group[0].length === 0 ||
      !Array.isArray(group[1]) ||
      group[1].length === 0
    ) {
      throw new Error("Catalog artifact contains an invalid target group.");
    }

    const [targetFamily, targetIds] = group;
    if (
      previousFamily !== null &&
      compareOrdinalStrings(previousFamily, targetFamily) >= 0
    ) {
      throw new Error(
        "Catalog artifact target groups must be unique and sorted.",
      );
    }
    previousFamily = targetFamily;

    let previousId = null;
    for (const targetId of targetIds) {
      if (
        typeof targetId !== "string" ||
        targetId.length === 0 ||
        (previousId !== null &&
          compareOrdinalStrings(previousId, targetId) >= 0)
      ) {
        throw new Error(
          "Catalog artifact target IDs must be unique, non-empty strings sorted within each family.",
        );
      }
      previousId = targetId;
    }
    logicalCount += targetIds.length;
  }

  return logicalCount;
}

export function countCatalogArtifactLogicalRecords(storage, records) {
  if (!isRecord(storage) || typeof storage.kind !== "string") {
    throw new Error("Catalog artifact has no valid storage descriptor.");
  }
  if (!Array.isArray(records)) {
    throw new Error("Catalog artifact records must be an array.");
  }

  switch (storage.kind) {
    case "object":
      return records.length;
    case "tuple":
      assertTupleStorageDescriptor(storage);
      if (
        records.some(
          (record) =>
            !Array.isArray(record) || record.length !== storage.fields.length,
        )
      ) {
        throw new Error(
          `Catalog tuple records must contain exactly ${storage.fields.length} field(s).`,
        );
      }
      return records.length;
    case "derived_target_groups":
      if (storage.targetField !== "target") {
        throw new Error(
          "Catalog derived target-group storage must use the target field.",
        );
      }
      return countDerivedTargetGroups(records);
    default:
      throw new Error(
        `Catalog artifact uses unknown storage kind '${storage.kind}'.`,
      );
  }
}

export function assertCatalogArtifactManifestContract({
  artifact,
  envelope,
  catalogSchema,
}) {
  if (
    !isRecord(artifact) ||
    typeof artifact.family !== "string" ||
    artifact.family.length === 0 ||
    !Number.isSafeInteger(artifact.record_count) ||
    artifact.record_count < 0
  ) {
    throw new Error("Catalog manifest contains an invalid family artifact.");
  }
  if (!isRecord(catalogSchema) || !isRecord(catalogSchema.storage)) {
    throw new Error("Catalog schema has no valid storage map.");
  }
  if (
    typeof catalogSchema.schema_version !== "string" ||
    catalogSchema.schema_version.length === 0
  ) {
    throw new Error("Catalog schema has no valid schema version.");
  }
  if (!isRecord(envelope)) {
    throw new Error("Catalog artifact envelope must be an object.");
  }
  if (envelope.schema_version !== catalogSchema.schema_version) {
    throw new Error(
      "Catalog artifact and bound schema have different schema versions.",
    );
  }
  if (envelope.family !== artifact.family) {
    throw new Error(
      `Catalog artifact family '${String(envelope.family)}' does not match manifest family '${artifact.family}'.`,
    );
  }

  const storage = catalogSchema.storage[artifact.family];
  if (storage === undefined) {
    throw new Error(
      `Catalog schema has no storage descriptor for family '${artifact.family}'.`,
    );
  }
  const logicalCount = countCatalogArtifactLogicalRecords(
    storage,
    envelope.records,
  );
  if (logicalCount !== artifact.record_count) {
    throw new Error(
      `Catalog artifact logical record count ${logicalCount} does not match manifest count ${artifact.record_count}.`,
    );
  }
  return logicalCount;
}

export function assertCatalogManifestFamilyPartition({
  manifest,
  catalogSchema,
}) {
  if (
    !isRecord(manifest) ||
    !Array.isArray(manifest.artifacts) ||
    !Array.isArray(manifest.build_artifacts)
  ) {
    throw new Error(
      "Catalog manifest must declare runtime and build artifact arrays.",
    );
  }
  if (
    !isRecord(catalogSchema) ||
    !Array.isArray(catalogSchema.family_names) ||
    !isRecord(catalogSchema.publication_states)
  ) {
    throw new Error(
      "Catalog schema must declare family names and publication states.",
    );
  }
  const familyNames = catalogSchema.family_names;
  if (
    familyNames.some(
      (family) => typeof family !== "string" || family.length === 0,
    ) ||
    new Set(familyNames).size !== familyNames.length
  ) {
    throw new Error("Catalog schema family names must be unique strings.");
  }
  const expectedBuildFamilies = familyNames
    .filter(
      (family) => catalogSchema.publication_states[family] === "build-only",
    )
    .sort(compareOrdinalStrings);
  const expectedRuntimeFamilies = familyNames
    .filter(
      (family) => catalogSchema.publication_states[family] !== "build-only",
    )
    .sort(compareOrdinalStrings);
  const assertExactFamilySet = (entries, expected, label) => {
    const actual = entries.map((entry) =>
      isRecord(entry) && typeof entry.family === "string" ? entry.family : null,
    );
    if (
      actual.some((family) => family === null) ||
      new Set(actual).size !== actual.length ||
      JSON.stringify([...actual].sort(compareOrdinalStrings)) !==
        JSON.stringify(expected)
    ) {
      throw new Error(
        `Catalog manifest ${label} families do not exactly match the descriptor-derived schema.`,
      );
    }
  };
  assertExactFamilySet(
    manifest.artifacts,
    expectedRuntimeFamilies,
    "runtime artifact",
  );
  assertExactFamilySet(
    manifest.build_artifacts,
    expectedBuildFamilies,
    "build artifact",
  );
}
