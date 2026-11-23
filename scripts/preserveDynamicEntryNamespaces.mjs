import path from "node:path";

function namespacePlugin(cwd, loaders) {
  const targets = new Map();

  return {
    name: "dynamic-entry-namespaces",
    async resolveId(source, importer, { kind }) {
      const target = targets.get(importer);
      if (target && source === "./entry") return target;
      if (kind !== "dynamic-import") return;

      const resolved = await this.resolve(source, importer, {
        kind,
        skipSelf: true,
      });
      if (!resolved || resolved.external) return;
      const info = await this.load({ id: resolved.id });
      // Text modules export a default value, but Rolldown omits it from exports.
      const textModule = loaders?.[path.extname(resolved.id)] === "text";
      if (
        !info.isEntry ||
        (!textModule &&
          (info.exports.length !== 1 || info.exports[0] !== "default"))
      )
        return;

      const relative = path
        .relative(cwd, resolved.id)
        .split(path.sep)
        .join("/");
      const id = `\0salt-dynamic-import/${relative}.js`;
      targets.set(id, resolved.id);
      return id;
    },
    load(id) {
      if (targets.has(id))
        return {
          code: 'export { default } from "./entry";',
          moduleType: "js",
        };
    },
  };
}

export function preserveDynamicEntryNamespaces() {
  return {
    name: "preserve-dynamic-entry-namespaces",
    tsdownConfigResolved(config) {
      if (config.format !== "cjs" || !config.unbundle || !config.cjsDefault)
        return;

      // Default-only entries must keep returning the value from require().
      // Rolldown 1.3 also returns that bare value from internal import() calls.
      // A non-entry re-export gives dynamic imports their module namespace.
      // Add a separate plugin per CJS build without replacing shared plugins.
      config.plugins = [
        config.plugins,
        namespacePlugin(config.cwd, config.loader),
      ];
    },
  };
}
