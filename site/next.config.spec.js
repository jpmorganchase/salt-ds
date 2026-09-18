import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const nextConfig = require("./next.config.js");

function configFor(environment, fileExists) {
  return nextConfig(undefined, { environment, fileExists });
}

describe("site Next configuration", () => {
  it("keeps an ordinary clean checkout unchanged", () => {
    const config = configFor({}, () => false);

    expect(config.env.NEXT_PUBLIC_SALT_OFFLINE_AUTHOR_PREVIEW).toBe("0");
    const webpack = { resolve: { alias: {} }, module: { rules: [] } };
    expect(config.webpack(webpack)).toBe(webpack);
    expect(webpack.resolve.alias).toEqual({});
  });

  it("rejects generated local preview files during an ordinary build", () => {
    expect(() => configFor({}, () => true)).toThrow(
      /site\/public\/ai.*SALT_OFFLINE_AUTHOR_PREVIEW=1.*remove site\/public\/ai/u,
    );
  });

  it("permits generated preview files only in explicit offline-author mode", () => {
    const config = configFor({ SALT_OFFLINE_AUTHOR_PREVIEW: "1" }, () => true);

    expect(config.env.NEXT_PUBLIC_SALT_OFFLINE_AUTHOR_PREVIEW).toBe("1");
    const webpack = { resolve: { alias: {} }, module: { rules: [] } };
    config.webpack(webpack);
    expect(webpack.resolve.alias["@site/fonts"]).toMatch(
      /fonts[\\/]offline\.ts$/u,
    );
  });

  it("does not accept a public environment variable as offline authorization", () => {
    expect(() =>
      configFor({ NEXT_PUBLIC_SALT_OFFLINE_AUTHOR_PREVIEW: "1" }, () => true),
    ).toThrow(/site\/public\/ai/u);
    expect(
      configFor({ NEXT_PUBLIC_SALT_OFFLINE_AUTHOR_PREVIEW: "1" }, () => false)
        .env.NEXT_PUBLIC_SALT_OFFLINE_AUTHOR_PREVIEW,
    ).toBe("0");
  });
});
