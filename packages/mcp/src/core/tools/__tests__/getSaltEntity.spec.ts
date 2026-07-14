import { beforeAll, describe, expect, it } from "vitest";
import { loadRegistry } from "../../registry/loadRegistry.js";
import type { SaltRegistry } from "../../types.js";
import { getSaltEntity } from "../getSaltEntity.js";

describe("getSaltEntity auto resolution", () => {
  let registry: SaltRegistry;

  beforeAll(async () => {
    registry = await loadRegistry();
  });

  it("prefers an exact canonical package name over an earlier guide alias", () => {
    const result = getSaltEntity(registry, { name: "@salt-ds/core" });

    expect(result.decision.status).toBe("found");
    expect(result.entity_type).toBe("package");
    expect(result.entity).toMatchObject({ name: "@salt-ds/core" });
  });

  it("uses stable family priority when canonical names collide", () => {
    const result = getSaltEntity(registry, { name: "Vertical navigation" });

    expect(result.decision.status).toBe("found");
    expect(result.entity_type).toBe("component");
    expect(result.entity).toMatchObject({ name: "Vertical navigation" });
  });

  it("does not substitute broad guide-content matches for exact names", () => {
    for (const name of [
      "React web applications",
      "production ready UI components",
      "pass through wrapper",
    ]) {
      const autoResult = getSaltEntity(registry, { name });
      const guideResult = getSaltEntity(registry, {
        entity_type: "guide",
        name,
      });

      expect(autoResult.decision.status).toBe("not_found");
      expect(autoResult.entity).toBeNull();
      expect(guideResult.decision.status).toBe("not_found");
      expect(guideResult.entity).toBeNull();
    }
  });

  it("preserves registered guide aliases in exact reference lookup", () => {
    const result = getSaltEntity(registry, {
      entity_type: "guide",
      name: "When wrappers help",
    });

    expect(result.decision.status).toBe("found");
    expect(result.entity_type).toBe("guide");
    expect(result.entity).toMatchObject({ name: "Custom wrappers" });
  });

  it("returns exact deprecated tokens without fabricating a replacement", () => {
    const result = getSaltEntity(registry, {
      name: "--salt-actionable-primary-background",
    });

    expect(result.decision.status).toBe("found");
    expect(result.entity_type).toBe("token");
    expect(result.entity).toMatchObject({
      name: "--salt-actionable-primary-background",
      deprecated: true,
    });
    expect(result.entity).not.toHaveProperty("replacement_token");
    expect(result.next_step).toContain(
      "--salt-actionable-primary-background is deprecated",
    );
    expect(result.next_step).toContain("no source-backed replacement");
    expect(result.next_step).toContain("authoritative Salt migration guidance");
  });
});
