import type { Plugin as EsbuildPlugin } from "esbuild";
import type { PluginCreator } from "postcss";

export function transformCss(code: string, filename: string): string;
export function transformCssFile(from: string, to?: string): Promise<void>;
export const postcssCssBaseline: PluginCreator<void>;
export function esbuildCssBaseline(): EsbuildPlugin;
