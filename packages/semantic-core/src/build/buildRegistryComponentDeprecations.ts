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

function deprecationMatchesComponent(
  component: ComponentRecord,
  deprecation: DeprecationRecord,
): boolean {
  if (component.package.name !== deprecation.package) {
    return false;
  }

  const componentKey = componentMatchKey(component.name);
  const deprecationComponentKey = componentMatchKey(deprecation.component);
  const deprecationNameKey = componentMatchKey(deprecation.name);

  if (
    deprecationComponentKey.length > 0 &&
    deprecationComponentKey === componentKey
  ) {
    return true;
  }

  if (deprecationNameKey.length > 0 && deprecationNameKey === componentKey) {
    return true;
  }

  const sourcePath = deprecation.source_urls.find((entry) =>
    entry.startsWith("packages/"),
  );
  if (sourcePath && component.source.repo_path) {
    const normalizedSourcePath = toPosixPath(sourcePath);
    const normalizedComponentPath = toPosixPath(component.source.repo_path);
    if (
      normalizedSourcePath.startsWith(`${normalizedComponentPath}/`) ||
      normalizedSourcePath === normalizedComponentPath
    ) {
      return true;
    }
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
        .sort((left, right) => left.localeCompare(right));
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
          component: componentInferred ? component.name : deprecation.component,
          inference,
        };
      }

      if (matched.length > 1) {
        for (const component of matched) {
          const depIds = componentDeprecationIds.get(component.id) ?? [];
          depIds.push(deprecation.id);
          componentDeprecationIds.set(component.id, depIds);
          incrementComponentDeprecationInference(component.id, {
            matched_count: 1,
            ambiguous_match_count: 1,
          });
        }
      }

      return {
        ...deprecation,
        inference,
      };
    },
  );

  const updatedComponents = components.map((component) => ({
    ...component,
    deprecations: uniqueStrings(
      componentDeprecationIds.get(component.id) ?? [],
    ).sort((left, right) => left.localeCompare(right)),
    inference: {
      ...component.inference,
      deprecations:
        componentDeprecationInference.get(component.id) ??
        defaultDeprecationInference(),
    },
  }));

  return { components: updatedComponents, deprecations: updatedDeprecations };
}
