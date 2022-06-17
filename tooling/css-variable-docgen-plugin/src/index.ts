import type { Plugin } from "vite";
import path from "path";
import glob from "glob-promise";
import { PathLike, promises } from "fs";
import { findLast, generate, parse, walk } from "css-tree";
import * as ts from "typescript";

const { readFile } = promises;

export interface Options {
  /** Glob patterns to ignore */
  exclude?: string[];
  /** Glob patterns to include. defaults to ts|tsx */
  include?: string[];
}

/** Create a glob matching function. */
function matchGlob(globs: string[] = []) {
  const matchers = globs.map((g) => glob(g, { dot: true }));

  return async (filename: string) => {
    const matches: string[] = (await Promise.all(matchers))[0] || [];
    return Boolean(
      filename &&
        matches.find(
          (match) =>
            path.normalize(filename) === path.join(process.cwd(), match)
        )
    );
  };
}

export interface ClassName {
  name: string;
  description: string;
}

interface PrivateVariable {
  name: string;
  value?: string;
}

export interface CSSVariable {
  name: string;
  property?: string;
  fallbackValue?: string;
}

/**
 * @param className classname
 * @param value Classname definition
 */
function createClassNameDefinition(className: string, value: ClassName) {
  /** Set a property with a string value */
  const setStringLiteralField = (fieldName: string, fieldValue: string) =>
    ts.factory.createPropertyAssignment(
      ts.factory.createStringLiteral(fieldName),
      ts.factory.createStringLiteral(fieldValue)
    );

  /**
   * ```
   * SimpleComponent.__docgenInfo.classNames.someClassName.name = "someClassname";
   * ```
   * @param name ClassName.
   */
  const setName = (name: string) => setStringLiteralField("name", name);

  /**
   * ```
   * SimpleComponent.__docgenInfo.classNames.someClassName.description = "ClassName description.";
   * ```
   * @param description ClassName description.
   */
  const setDescription = (description: string) =>
    setStringLiteralField("description", description);

  return ts.factory.createPropertyAssignment(
    ts.factory.createStringLiteral(className),
    ts.factory.createObjectLiteralExpression([
      setDescription(value.description),
      setName(value.name),
    ])
  );
}

/**
 * @param name CSS Variable name
 * @param value CSS Variable definition
 */
function createCSSVariablesApiDefinition(name: string, value: CSSVariable) {
  /** Set a property with a string value */
  const setStringLiteralField = (fieldName: string, fieldValue: string) =>
    ts.factory.createPropertyAssignment(
      ts.factory.createStringLiteral(fieldName),
      ts.factory.createStringLiteral(fieldValue)
    );

  /** Set a property with a null value */
  const setNullField = (fieldName: string) =>
    ts.factory.createPropertyAssignment(
      ts.factory.createStringLiteral(fieldName),
      ts.factory.createNull()
    );

  /**
   * ```
   * SimpleComponent.__docgenInfo.cssVariablesApi.someCSSVariable.name = "someCSSVariable";
   * ```
   * @param name Prop name.
   */
  const setName = (name: string) => setStringLiteralField("name", name);

  /**
   * ```
   * SimpleComponent.__docgenInfo.cssVariablesApi.someCSSVariable.type = "someSelectorType";
   * ```
   * @param type Type.
   */
  const setType = (type?: string) =>
    type ? setStringLiteralField("type", type) : setNullField("type");

  /**
   * ```
   * SimpleComponent.__docgenInfo.cssVariablesApi.someCSSVariable.defaultValue = "defaultValue";
   * ```
   * @param defaultValue defaultValue.
   */
  const setDefaultValue = (defaultValue?: string) =>
    defaultValue
      ? setStringLiteralField("defaultValue", defaultValue)
      : setNullField("defaultValue");

  return ts.factory.createPropertyAssignment(
    ts.factory.createStringLiteral(name),
    ts.factory.createObjectLiteralExpression([
      setName(value.name),
      setType(value.property),
      setDefaultValue(value.fallbackValue),
    ])
  );
}

export function cssVariableDocgen(options: Options = {}): Plugin {
  const { exclude = ["**/**.stories.tsx"], include = ["**/*.tsx"] } = options;
  const isExcluded = matchGlob(exclude);
  const isIncluded = matchGlob(include);

  const valueTypes = ["Identifier", "Dimension", "Number", "Percentage"];

  return {
    name: "vite-plugin-css-variable-docgen",
    enforce: "post",
    async transform(code, id) {
      if (!(await isExcluded(id)) && (await isIncluded(id))) {
        const cssImports: string[] = [];

        const sourceFile = ts.createSourceFile(
          id,
          code,
          ts.ScriptTarget.ESNext
        );

        ts.forEachChild(sourceFile, (node) => {
          if (
            ts.isImportDeclaration(node) &&
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            node.moduleSpecifier.text.endsWith(".css")
          ) {
            cssImports.push(
              // @ts-ignore
              path.resolve(path.dirname(id), node.moduleSpecifier.text)
            );
          }
        });

        const safeReadFile = async (
          path: Parameters<typeof readFile>[0]
        ): Promise<{
          path: PathLike | promises.FileHandle;
          contents: string;
        }> => {
          try {
            const contents = await readFile(path, "utf-8");
            return { path, contents };
          } catch (e) {
            return { path, contents: "" };
          }
        };

        const cssFiles = (
          await Promise.all(
            cssImports.map((cssImport) => safeReadFile(cssImport))
          )
        ).filter(Boolean);

        const classNames: Record<string, ClassName> = {};
        const privateVariableMap: Record<string, PrivateVariable> = {};
        const identifierMap: Record<string, CSSVariable> = {};

        cssFiles.forEach(({ path, contents }) => {
          const comments: Record<number, string> = {};

          const ast = parse(contents, {
            positions: true,
            parseValue: true,
            parseRulePrelude: true,
            parseCustomProperty: true,
            parseAtrulePrelude: true,
            onComment: (value, location) => {
              comments[location.end.line] = value.trim();
            },
          });

          walk(ast, {
            visit: "Selector",
            enter(node) {
              if (
                this.selector?.loc?.start.line &&
                comments[this.selector.loc.start.line - 1]
              ) {
                const name = generate(node);
                if (
                  !comments[this.selector.loc.start.line - 1].includes(
                    "@ignore"
                  )
                ) {
                  classNames[name] = {
                    name,
                    description: comments[this.selector.loc.start.line - 1],
                  };
                }
              }
            },
          });

          walk(ast, {
            visit: "Declaration",
            enter(node) {
              if (node.type === "Declaration") {
                if (node.property.startsWith("--")) {
                  try {
                    privateVariableMap[node.property] = {
                      name: node.property,
                      value: generate(
                        findLast(node.value, (node) =>
                          valueTypes.includes(node.type)
                        )
                      ),
                    };
                  } catch (e) {
                    console.warn(
                      e,
                      `Encountered issue parsing CSS variable declaration "${node.property}" in "${path}"`
                    );
                  }
                }
              }
            },
          });

          walk(ast, {
            visit: "Identifier",
            enter(node) {
              const name = node.name;
              if (name.startsWith("--")) {
                try {
                  identifierMap[name] = {
                    name,
                    property: this.declaration?.property,
                    fallbackValue: this.declaration
                      ? generate(
                          findLast(this.declaration, (node) =>
                            valueTypes.includes(node.type)
                          )
                        )
                      : undefined,
                  };
                } catch (e) {
                  console.warn(
                    `Encountered issue parsing CSS variable "${name}" in "${path}"`
                  );
                }
              }
            },
          });
        });

        const resolveProperty = (
          identifierMap: Record<string, CSSVariable>,
          property: string | undefined
        ): string | undefined => {
          if (!property || !identifierMap[property]) {
            return property;
          }

          if (property === identifierMap[property].property) {
            return property;
          }

          return resolveProperty(
            identifierMap,
            identifierMap[property].property
          );
        };

        const resolveValue = (
          value: string | undefined
        ): string | undefined => {
          if (!value || !privateVariableMap[value]) {
            return value;
          }
          try {
            return resolveValue(privateVariableMap[value].value);
          } catch (e) {
            console.log(e);
          }
        };

        Object.keys(identifierMap).forEach((key) => {
          const identifier = identifierMap[key];
          identifierMap[key].property = resolveProperty(
            identifierMap,
            identifier.property
          );
          identifierMap[key].fallbackValue = resolveValue(
            identifier.fallbackValue
          );
        });

        const transformer = <T extends ts.Node>(
          context: ts.TransformationContext
        ) => {
          return (rootNode: T) => {
            function visit(node: ts.Node): ts.Node {
              if (
                ts.isBinaryExpression(node) &&
                ts.isPropertyAccessExpression(node.left) &&
                ts.isIdentifier(node.left.name) &&
                node.left.name.escapedText === "___docgenInfo" &&
                ts.isObjectLiteralExpression(node.right)
              ) {
                return ts.factory.updateBinaryExpression(
                  node,
                  node.left,
                  node.operatorToken,
                  ts.factory.updateObjectLiteralExpression(node.right, [
                    ...node.right.properties,
                    ts.factory.createPropertyAssignment(
                      ts.factory.createStringLiteral("classNames"),
                      ts.factory.createObjectLiteralExpression(
                        Object.entries(classNames).map(([className, value]) =>
                          createClassNameDefinition(className, value)
                        )
                      )
                    ),
                    ts.factory.createPropertyAssignment(
                      ts.factory.createStringLiteral("cssVariablesApi"),
                      ts.factory.createObjectLiteralExpression(
                        Object.entries(identifierMap).map(([name, value]) =>
                          createCSSVariablesApiDefinition(name, value)
                        )
                      )
                    ),
                  ])
                );
              }

              return ts.visitEachChild(node, visit, context);
            }
            return ts.visitNode(rootNode, visit);
          };
        };

        const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
        const result = ts.transform<ts.SourceFile>(sourceFile, [transformer]);
        const transformedSourceFile = result.transformed[0];
        const newContent = printer.printFile(transformedSourceFile);
        result.dispose();

        return {
          code: newContent,
          map: null,
        };
      }
    },
  };
}
