import type { MDXComponents } from "next-mdx-remote-client";
import * as components from "../components";

// The shared barrel also exports controls and token data for site code. Keep
// those helpers out of the MDX element registry while retaining every component.
const {
  themes: _themes,
  densities: _densities,
  getThemeDisplayName: _getThemeDisplayName,
  LivePreviewContext: _LivePreviewContext,
  useLivePreviewControls: _useLivePreviewControls,
  ...registry
} = components;

export const mdxComponents = registry satisfies MDXComponents;
