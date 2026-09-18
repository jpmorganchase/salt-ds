import { describe, expect, it } from "vitest";
import type { KnowledgeRecordStore } from "@salt-ds/knowledge";
import { searchSalt, searchSaltRecords } from "../searchSalt.js";

function fixtureStore(): KnowledgeRecordStore {
  const documents = [
    {
      family: "search_document",
      id: "search.component.button",
      target: { family: "component", id: "button" },
      title: "Button",
      summary: "Use Button for actions.",
      terms: ["button", "action"],
      facets: { status: ["stable"] },
    },
    {
      family: "search_document",
      id: "search.component.link",
      target: { family: "component", id: "link" },
      title: "Link",
      summary: "Use Link for navigation.",
      terms: ["link", "navigation"],
      facets: { status: ["stable"] },
    },
  ];
  return {
    manifest: {
      catalog_version: "0.1.0",
      semantic_digest: `sha256:${"a".repeat(64)}`,
      generator: { mode: "test" },
    },
    getFamily(family: string) {
      return family === "search_document" ? documents : [];
    },
  } as unknown as KnowledgeRecordStore;
}

describe("protocol-neutral Salt search", () => {
  it("keeps record identity separate from prototype resource rendering", () => {
    const store = fixtureStore();
    const neutral = searchSaltRecords(store, {
      query: "button action",
      families: ["component"],
    });
    const publicResult = searchSalt(store, {
      query: "button action",
      families: ["component"],
    });

    expect(neutral.matches[0]).toMatchObject({
      reference: { family: "component", id: "button" },
      title: "Button",
    });
    expect(neutral.matches[0]).not.toHaveProperty("uri");
    expect(neutral.matches[0]).not.toHaveProperty("provenance.resource_uri");
    expect(publicResult.data.matches[0]).toMatchObject({
      family: "component",
      id: "button",
      uri: expect.stringMatching(/^salt:\/\/catalog\/v2\//u),
    });
  });
});
