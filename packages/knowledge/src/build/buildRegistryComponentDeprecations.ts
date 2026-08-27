import { compareOrdinalStrings } from "../catalog/catalogSerialization.js";
import { toPosixPath } from "../registry/paths.js";
import type {
  ComponentDeprecationInference,
  ComponentRecord,
  DeprecationRecord,
} from "../types.js";
import { toMatchKey, uniqueStrings } from "./buildRegistryShared.js";

function componentMatchKey(value: string | null): string {
  if (!value) {
    return "";
  }

  return toMatchKey(value.replace(/props$/i, ""));
}

function componentSourceRoot(component: ComponentRecord): string | null {
  if (!component.source.repo_path) return null;
  const sourcePath = toPosixPath(component.source.repo_path);
  if (!component.source.export_name) return sourcePath;
  const lastSeparator = sourcePath.lastIndexOf("/");
  return sourcePath.slice(0, Math.max(0, lastSeparator));
}

function componentPrimarySourcePath(component: ComponentRecord): string | null {
  if (!component.source.repo_path || !component.source.export_name) return null;
  return toPosixPath(component.source.repo_path);
}

function componentHasExactPropSubject(
  component: ComponentRecord,
  deprecation: DeprecationRecord,
): boolean {
  const member = deprecation.subject.member_path[0];
  if (member?.kind !== "prop") return false;
  return (
    component.prop_subjects?.some(
      (subject) =>
        subject.package === deprecation.subject.package &&
        subject.entrypoint === deprecation.subject.entrypoint &&
        subject.export_name === deprecation.subject.export_name &&
        subject.symbol_space === deprecation.subject.symbol_space &&
        subject.member_path.length === 1 &&
        subject.member_path[0]?.kind === "prop" &&
        subject.member_path[0].name === member.name,
    ) === true
  );
}

function deprecationHasComponentSourceProvenance(
  component: ComponentRecord,
  deprecation: DeprecationRecord,
): boolean {
  const sourceRoot = componentSourceRoot(component);
  if (!sourceRoot) return false;
  const deprecationSourcePaths = uniqueStrings([
    ...(deprecation.source_paths ?? []),
    ...deprecation.source_occurrences.map(
      (occurrence) => occurrence.source_path,
    ),
  ]).map(toPosixPath);
  return deprecationSourcePaths.some(
    (sourcePath) =>
      sourcePath === sourceRoot || sourcePath.startsWith(`${sourceRoot}/`),
  );
}

function deprecationMatchesComponent(
  component: ComponentRecord,
  deprecation: DeprecationRecord,
): boolean {
  if (
    component.package.name !== deprecation.package ||
    !deprecationHasComponentSourceProvenance(component, deprecation)
  ) {
    return false;
  }

  const componentKey = componentMatchKey(component.name);
  if (deprecation.subject.member_path.length > 0) {
    if (
      deprecation.subject.member_path[0]?.kind === "prop" &&
      !componentHasExactPropSubject(component, deprecation)
    ) {
      return false;
    }
    const declaredComponentKey = componentMatchKey(deprecation.component);
    if (declaredComponentKey.length > 0) {
      return declaredComponentKey === componentKey;
    }
    if (deprecation.subject.symbol_space === "type") {
      return false;
    }
    return componentMatchKey(deprecation.subject.export_name) === componentKey;
  }
  const deprecationComponentKey = componentMatchKey(deprecation.component);
  const deprecationNameKey = componentMatchKey(deprecation.name);
  const primarySourcePath = componentPrimarySourcePath(component);
  const componentExportName = component.source.export_name;
  const deprecationSourcePaths = uniqueStrings([
    ...(deprecation.source_paths ?? []),
    ...deprecation.source_occurrences.map(
      (occurrence) => occurrence.source_path,
    ),
  ]).map(toPosixPath);

  if (
    deprecation.subject.symbol_space === "type" ||
    !primarySourcePath ||
    !componentExportName ||
    deprecation.subject.export_name !== componentExportName ||
    !deprecationSourcePaths.includes(primarySourcePath)
  ) {
    return false;
  }

  if (
    deprecationComponentKey.length > 0 &&
    deprecationComponentKey === componentKey
  ) {
    return true;
  }

  if (deprecationNameKey.length > 0 && deprecationNameKey === componentKey) {
    return true;
  }

  return false;
}

function defaultDeprecationInference(): ComponentDeprecationInference {
  return {
    matched_count: 0,
    inferred_component_count: 0,
    ambiguous_match_count: 0,
  };
}

export function linkDeprecationsToComponents(
  components: ComponentRecord[],
  deprecations: DeprecationRecord[],
): {
  components: ComponentRecord[];
  deprecations: DeprecationRecord[];
} {
  const componentDeprecationIds = new Map<string, string[]>();
  const componentDeprecationInference = new Map<
    string,
    ComponentDeprecationInference
  >();
  const incrementComponentDeprecationInference = (
    componentId: string,
    update: Partial<ComponentDeprecationInference>,
  ) => {
    const existing =
      componentDeprecationInference.get(componentId) ??
      defaultDeprecationInference();
    componentDeprecationInference.set(componentId, {
      matched_count: existing.matched_count + (update.matched_count ?? 0),
      inferred_component_count:
        existing.inferred_component_count +
        (update.inferred_component_count ?? 0),
      ambiguous_match_count:
        existing.ambiguous_match_count + (update.ambiguous_match_count ?? 0),
    });
  };

  const updatedDeprecations: DeprecationRecord[] = deprecations.map(
    (deprecation) => {
      const matched = components.filter((component) =>
        deprecationMatchesComponent(component, deprecation),
      );
      const matchedComponentNames = matched
        .map((component) => component.name)
        .sort(compareOrdinalStrings);
      const componentInferred = !deprecation.component && matched.length === 1;
      const ambiguousComponentMatch = matched.length > 1;
      const inference = {
        matched_component_names: matchedComponentNames,
        component_inferred: componentInferred,
        ambiguous_component_match: ambiguousComponentMatch,
      };

      if (matched.length === 1) {
        const [component] = matched;
        const depIds = componentDeprecationIds.get(component.id) ?? [];
        depIds.push(deprecation.id);
        componentDeprecationIds.set(component.id, depIds);
        incrementComponentDeprecationInference(component.id, {
          matched_count: 1,
          inferred_component_count: componentInferred ? 1 : 0,
        });

        return {
          ...deprecation,
          component: component.name,
          kind:
            deprecation.kind === "other" &&
            deprecation.subject.member_path.length === 0 &&
            deprecation.subject.symbol_space !== "type"
              ? "component"
              : deprecation.kind,
          inference,
        };
      }

      if (matched.length > 1) {
        for (const component of matched) {
          incrementComponentDeprecationInference(component.id, {
            matched_count: 1,
            ambiguous_match_count: 1,
          });
        }
      }

      return {
        ...deprecation,
        component: null,
        inference,
      };
    },
  );

  const updatedComponents = components.map((component) => ({
    ...component,
    deprecations: uniqueStrings(
      componentDeprecationIds.get(component.id) ?? [],
    ).sort(compareOrdinalStrings),
    inference: {
      ...component.inference,
      deprecations:
        componentDeprecationInference.get(component.id) ??
        defaultDeprecationInference(),
    },
  }));

  return { components: updatedComponents, deprecations: updatedDeprecations };
}
