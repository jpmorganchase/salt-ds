import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

// Definitions longer than this aren't shown; agents read the declarations.
const MAX_DEFINITION_LENGTH = 200;
// DOM element types, as in HTMLAttributes<HTMLDivElement>, by tag.
const ELEMENT_TAGS = {
  HTMLAnchorElement: "a",
  HTMLButtonElement: "button",
  HTMLDivElement: "div",
  HTMLFieldSetElement: "fieldset",
  HTMLFormElement: "form",
  HTMLImageElement: "img",
  HTMLInputElement: "input",
  HTMLLabelElement: "label",
  HTMLLIElement: "li",
  HTMLOListElement: "ol",
  HTMLParagraphElement: "p",
  HTMLSpanElement: "span",
  HTMLTableElement: "table",
  HTMLTextAreaElement: "textarea",
  HTMLUListElement: "ul",
};

// At most this many new definitions under one props table: the types it
// names, then the types their definitions name.
const MAX_DEFINITIONS = 6;
const SKIPPED_FOLDERS = new Set(["__tests__", "stories", "examples"]);
const MODULE_EXTENSIONS = [".ts", ".tsx", "/index.ts", "/index.tsx"];

const printer = ts.createPrinter({ removeComments: true });
const oneLine = (text) => text.replace(/\s+/g, " ").trim();

function sourceFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!SKIPPED_FOLDERS.has(entry.name)) files.push(...sourceFiles(file));
    } else if (
      /\.tsx?$/.test(entry.name) &&
      !/\.(spec|test|stories)\./.test(entry.name)
    ) {
      files.push(file);
    }
  }
  return files;
}

function typeParameterText(node) {
  return node.typeParameters?.length
    ? `<${node.typeParameters.map((parameter) => parameter.name.text).join(", ")}>`
    : "";
}

const isExported = (node) =>
  node.modifiers?.some(
    (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
  ) ?? false;

/**
 * What a source file declares, imports and exports, as TypeScript resolves
 * names: its type aliases and interfaces, its imports by local name, its
 * re-exports, its exported values, the props type each exported component
 * takes, and its type parameters.
 */
function readFile(file, packageDirectory) {
  const sourceFile = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const print = (node) =>
    oneLine(printer.printNode(ts.EmitHint.Unspecified, node, sourceFile));
  const info = {
    file,
    packageDirectory,
    declarations: new Map(),
    // Local name -> { module, name } of the import.
    imports: new Map(),
    // Exported name -> local name, for `export { A as B }`.
    localExports: new Map(),
    // `export { A as B } from "m"`: { module, names: exported -> imported }.
    reexports: [],
    // `export * from "m"`.
    starExports: [],
    values: [],
    // Component name -> the props type text it takes.
    componentProps: new Map(),
    // Type parameter name -> constraint, first declaration first.
    typeParameters: new Map(),
  };
  const parametersOf = (node) =>
    (node.typeParameters ?? []).map((parameter) => ({
      name: parameter.name.text,
      constraint: parameter.constraint
        ? print(parameter.constraint)
        : undefined,
    }));
  // Property name -> its printed type, for an interface's or type literal's
  // members.
  const membersOf = (members) =>
    new Map(
      members
        .filter(
          (member) =>
            ts.isPropertySignature(member) &&
            member.type &&
            (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name)),
        )
        .map((member) => [member.name.text, print(member.type)]),
    );
  const propsOfFunction = (fn) => {
    const annotation = fn?.parameters?.[0]?.type;
    return annotation ? print(annotation) : undefined;
  };

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      const module = statement.moduleSpecifier.text;
      const bindings = statement.importClause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings)) {
        for (const element of bindings.elements) {
          info.imports.set(element.name.text, {
            module,
            name: (element.propertyName ?? element.name).text,
          });
        }
      }
    } else if (ts.isExportDeclaration(statement)) {
      const module = statement.moduleSpecifier?.text;
      if (!statement.exportClause) {
        if (module) info.starExports.push(module);
      } else if (ts.isNamedExports(statement.exportClause)) {
        const names = new Map(
          statement.exportClause.elements.map((element) => [
            element.name.text,
            (element.propertyName ?? element.name).text,
          ]),
        );
        if (module) info.reexports.push({ module, names });
        else
          for (const [exported, local] of names)
            info.localExports.set(exported, local);
      }
    } else if (isExported(statement)) {
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (!ts.isIdentifier(declaration.name)) continue;
          const name = declaration.name.text;
          info.values.push(name);
          // forwardRef<Element, Props>(…) or forwardRef(function (props: Props) …)
          const init = declaration.initializer;
          if (init && ts.isCallExpression(init)) {
            const props =
              init.typeArguments?.[1] ??
              (init.arguments[0] &&
              (ts.isFunctionExpression(init.arguments[0]) ||
                ts.isArrowFunction(init.arguments[0]))
                ? init.arguments[0].parameters?.[0]?.type
                : undefined);
            if (props) info.componentProps.set(name, print(props));
          } else if (
            init &&
            (ts.isArrowFunction(init) || ts.isFunctionExpression(init))
          ) {
            const props = propsOfFunction(init);
            if (props) info.componentProps.set(name, props);
          }
        }
      } else if (
        (ts.isFunctionDeclaration(statement) ||
          ts.isClassDeclaration(statement)) &&
        statement.name
      ) {
        info.values.push(statement.name.text);
        const props = ts.isFunctionDeclaration(statement)
          ? propsOfFunction(statement)
          : undefined;
        if (props) info.componentProps.set(statement.name.text, props);
      }
    }
  }

  const visit = (node) => {
    for (const parameter of parametersOf(node)) {
      if (!info.typeParameters.has(parameter.name)) {
        info.typeParameters.set(parameter.name, parameter.constraint);
      }
    }
    if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
      const name = node.name.text;
      const alias = ts.isTypeAliasDeclaration(node);
      const heritage = alias
        ? print(node.type)
        : (node.heritageClauses ?? []).map(print).join(" ");
      const text = alias
        ? print(node.type)
        : `${heritage ? `${heritage} ` : ""}{ ${node.members
            .map((member) => print(member).replace(/;$/, ""))
            .join("; ")} }`;
      // An alias's own members are its type literals', as in A & { … } or
      // PolymorphicComponentPropWithRef<T, { … }>.
      const literals = alias
        ? [
            node.type,
            ...(ts.isIntersectionTypeNode(node.type) ? node.type.types : []),
          ]
            .flatMap((type) =>
              ts.isTypeReferenceNode(type)
                ? (type.typeArguments ?? [])
                : [type],
            )
            .filter((type) => ts.isTypeLiteralNode(type))
        : [];
      // The first paragraph of its doc comment.
      const description = ts
        .getTextOfJSDocComment(node.jsDoc?.at(-1)?.comment)
        ?.split(/\n\s*\n/)[0]
        .replace(/\s+/g, " ")
        .trim();
      // The first declaration of a name in a file wins.
      if (!info.declarations.has(name)) {
        info.declarations.set(name, {
          name,
          kind: alias ? "alias" : "interface",
          signature: `${name}${typeParameterText(node)}`,
          text,
          heritage,
          members: alias
            ? new Map(
                literals.flatMap((literal) => [...membersOf(literal.members)]),
              )
            : membersOf(node.members),
          parameters: parametersOf(node),
          // A conditional type, which its description explains better.
          conditional: alias && ts.isConditionalTypeNode(node.type),
          description: description || undefined,
          exported: isExported(node),
          file,
          packageDirectory,
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return info;
}

/**
 * Resolves the Salt type names used in props tables to their definitions,
 * from the packages' TypeScript source. A name resolves as TypeScript does:
 * from the file that uses it, or through its import from a relative path or
 * a Salt package. Names from other packages, such as React's, and globals,
 * such as Element, aren't resolved.
 */
export function createTypeIndex({ packagesDir }) {
  let files;
  // Package -> exported value name -> the files declaring it.
  let values;
  function load() {
    if (files) return files;
    files = new Map();
    values = new Map();
    for (const packageDirectory of readdirSync(packagesDir)) {
      let list = [];
      try {
        list = sourceFiles(path.join(packagesDir, packageDirectory, "src"));
      } catch {
        continue;
      }
      const inPackage = new Map();
      for (const file of list) {
        const info = readFile(file, packageDirectory);
        files.set(file, info);
        for (const value of info.values) {
          inPackage.set(value, [...(inPackage.get(value) ?? []), file]);
        }
      }
      values.set(packageDirectory, inPackage);
    }
    return files;
  }

  /** The file a module specifier names, or undefined outside Salt's source. */
  function moduleFile(specifier, fromFile) {
    let base;
    if (specifier.startsWith(".")) {
      base = path.resolve(path.dirname(fromFile), specifier);
    } else {
      const salt = /^@salt-ds\/([\w-]+)$/.exec(specifier);
      if (!salt) return undefined;
      base = path.join(packagesDir, salt[1], "src", "index");
    }
    return [base, ...MODULE_EXTENSIONS.map((extension) => base + extension)]
      .filter((candidate) => /\.tsx?$/.test(candidate))
      .find((candidate) => load().has(candidate) || existsSync(candidate));
  }

  /** The exported declaration `name` of the module in `file`. */
  function exportedFrom(file, name, seen = new Set()) {
    const key = `${file}\0${name}`;
    if (seen.has(key)) return undefined;
    seen.add(key);
    const info = load().get(file);
    if (!info) return undefined;
    const own = info.declarations.get(name);
    if (own?.exported) return own;
    const local = info.localExports.get(name);
    if (local) {
      return info.declarations.get(local) ?? viaImport(info, local, seen);
    }
    for (const { module, names } of info.reexports) {
      if (!names.has(name)) continue;
      const target = moduleFile(module, file);
      return target ? exportedFrom(target, names.get(name), seen) : undefined;
    }
    for (const module of info.starExports) {
      const target = moduleFile(module, file);
      const found = target && exportedFrom(target, name, seen);
      if (found) return found;
    }
    return undefined;
  }

  function viaImport(info, name, seen) {
    const imported = info.imports.get(name);
    if (!imported) return undefined;
    const target = moduleFile(imported.module, info.file);
    return target ? exportedFrom(target, imported.name, seen) : undefined;
  }

  /** The declaration `name` refers to in `file`: its own, or its import's. */
  function resolve(name, file) {
    const info = load().get(file);
    if (!info) return undefined;
    return info.declarations.get(name) ?? viaImport(info, name, new Set());
  }

  /**
   * The props declarations a component in `file` takes, and the props types
   * they extend or combine, such as DatePickerRangeProps in
   * `type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps`.
   */
  function propsDeclarations(componentName, file) {
    const info = load().get(file);
    const names = [`${componentName}Props`];
    const taken = info?.componentProps.get(componentName);
    if (taken) {
      for (const [name] of taken.matchAll(/\b[A-Z]\w*\b/g)) {
        if (!names.includes(name)) names.push(name);
      }
    }
    const found = [];
    const queue = names.map((name) => ({ name, file, depth: 0 }));
    while (queue.length > 0) {
      const { name, file: from, depth } = queue.shift();
      const declaration = resolve(name, from);
      if (!declaration || found.includes(declaration)) continue;
      found.push(declaration);
      if (depth >= 3) continue;
      for (const [other] of declaration.heritage.matchAll(
        /\b[A-Z]\w*Props\b/g,
      )) {
        queue.push({ name: other, file: declaration.file, depth: depth + 1 });
      }
    }
    return found;
  }

  return {
    /**
     * The elements whose attributes a component's props extend, such as
     * "td" for ComponentPropsWithoutRef<"td">, following the Salt props
     * types they extend, such as ButtonProps.
     */
    elementsOf(componentName, file) {
      const elements = new Set();
      const seen = new Set();
      const visit = (declaration, depth) => {
        if (!declaration || depth > 4 || seen.has(declaration)) return;
        seen.add(declaration);
        const heritage = declaration.heritage ?? "";
        for (const [, tag] of heritage.matchAll(
          /ComponentProps(?:WithoutRef|WithRef)?<\s*"(\w+)"\s*>/g,
        )) {
          elements.add(tag);
        }
        for (const [, type] of heritage.matchAll(
          /HTMLAttributes<\s*(HTML\w*Element)\s*>/g,
        )) {
          if (ELEMENT_TAGS[type]) elements.add(ELEMENT_TAGS[type]);
        }
        for (const [other] of heritage.matchAll(/\b[A-Z]\w*Props\b/g)) {
          visit(resolve(other, declaration.file), depth + 1);
        }
      };
      for (const declaration of propsDeclarations(componentName, file)) {
        visit(declaration, 0);
      }
      return [...elements];
    },
    /**
     * A prop's type as the component's props types declare it, such as
     * `DateFrameworkType` where docgen prints the `any` it resolves to. Props
     * types combined in a union each give theirs, so the date picker's
     * `selectedDate` is `DateFrameworkType | DateRangeSelection | null`.
     */
    declaredPropType(componentName, file, propName) {
      const parts = [];
      for (const declaration of propsDeclarations(componentName, file)) {
        const text = declaration.members.get(propName);
        // A generic's own parameters, such as Selection, mean nothing here.
        const own = declaration.parameters.map(({ name }) => name);
        if (!text || namesIn([text]).some((name) => own.includes(name))) {
          continue;
        }
        for (const part of unionParts(text)) {
          if (!parts.includes(part)) parts.push(part);
        }
      }
      if (parts.length === 0) return undefined;
      // `null` and `undefined` read best last.
      const empty = (part) => part === "null" || part === "undefined";
      return [
        ...parts.filter((part) => !empty(part)),
        ...parts.filter(empty),
      ].join(" | ");
    },
    /**
     * The component and prop whose type a prop is declared as, as
     * BorderLayout's `gap` is `GridLayoutProps<T>["gap"]`, which docgen
     * prints as `any` but types for the component it names.
     */
    indexedPropSource(componentName, file, propName) {
      for (const declaration of propsDeclarations(componentName, file)) {
        const match = /^([A-Z]\w*)Props(?:<.*>)?\["(\w+)"\]$/.exec(
          declaration.members.get(propName) ?? "",
        );
        const source = match && resolve(`${match[1]}Props`, declaration.file);
        if (source) {
          return {
            packageDirectory: source.packageDirectory,
            componentName: match[1],
            propName: match[2],
          };
        }
      }
      return undefined;
    },
    /** The file declaring a package's exported value, when only one does. */
    declaringFile(packageDirectory, name) {
      load();
      const list = values.get(packageDirectory)?.get(name) ?? [];
      return list.length === 1 ? list[0] : undefined;
    },
    /**
     * Definitions for the Salt types named in `types`, the prop types of
     * `componentName` in `file`, and the Salt types those definitions name.
     * Definitions whose key is in `shown` are left out without counting
     * towards the limit, and the rest are added to it.
     */
    definitions(types, { file, componentName }, shown = new Set()) {
      const props = componentName ? propsDeclarations(componentName, file) : [];
      // The component's type parameters: its props types', or the file's.
      const parameters = new Map();
      for (const declaration of props) {
        for (const { name, constraint } of declaration.parameters) {
          if (!parameters.has(name)) parameters.set(name, constraint);
        }
      }
      const fileParameters = load().get(file)?.typeParameters ?? new Map();
      // Prop types resolve where the props are declared, then in the file.
      const contexts = [...new Set([...props.map((d) => d.file), file])];
      const queue = namesIn(types).map((name) => ({
        name,
        contexts,
        depth: 0,
      }));
      const seen = new Set();
      const definitions = [];
      while (queue.length > 0 && definitions.length < MAX_DEFINITIONS) {
        const { name, contexts: from, depth } = queue.shift();
        if (seen.has(name)) continue;
        seen.add(name);
        let definition;
        let found;
        if (
          depth === 0 &&
          (parameters.has(name) || (!props.length && fileParameters.has(name)))
        ) {
          const constraint = parameters.has(name)
            ? parameters.get(name)
            : fileParameters.get(name);
          definition = { name, kind: "parameter", constraint };
        } else {
          for (const context of from) {
            found = resolve(name, context);
            if (found) break;
          }
          if (!found) continue;
          const described = found.conditional && found.description;
          const short =
            !described && found.text.length <= MAX_DEFINITION_LENGTH;
          definition = {
            name,
            kind: found.kind,
            signature: found.signature,
            text: short ? found.text : undefined,
            ...(described ? { description: found.description } : {}),
            packageDirectory: found.packageDirectory,
          };
          if (short && depth === 0) {
            // A definition's own type parameters, such as T in Foo<T>, and
            // mapped types' keys, such as K in { [K in keyof T]: … }, are local.
            const own = new Set([
              ...found.parameters.map((parameter) => parameter.name),
              ...[...found.text.matchAll(/\[\s*([A-Za-z_]\w*)\s+in\b/g)].map(
                ([, key]) => key,
              ),
            ]);
            for (const nested of namesIn([found.text])) {
              if (!own.has(nested)) {
                queue.push({ name: nested, contexts: [found.file], depth: 1 });
              }
            }
          }
        }
        const key =
          definition.kind === "parameter"
            ? `parameter\0${name}\0${definition.constraint ?? ""}`
            : `${found.file}\0${name}`;
        if (shown.has(key)) continue;
        shown.add(key);
        definitions.push(definition);
      }
      return definitions;
    },
  };
}

/** The members of a printed union type, split outside brackets. */
function unionParts(text) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if ("([{<".includes(char)) depth += 1;
    // The `>` of an arrow function's `=>` closes nothing.
    else if (")]}".includes(char) || (char === ">" && text[index - 1] !== "="))
      depth -= 1;
    else if (char === "|" && depth === 0) {
      parts.push(text.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts.filter(Boolean);
}

/** The capitalized type names in type strings, outside string literals. */
export function namesIn(types) {
  const names = [];
  for (const type of types) {
    const code = type.replace(/"[^"]*"|'[^']*'|`[^`]*`/g, '""');
    for (const [name] of code.matchAll(/\b[A-Z][A-Za-z0-9_]*\b/g)) {
      if (!names.includes(name)) names.push(name);
    }
  }
  return names;
}
