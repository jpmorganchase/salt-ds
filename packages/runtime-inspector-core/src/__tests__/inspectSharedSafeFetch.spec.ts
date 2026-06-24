import { describe, expect, it } from "vitest";
import { assertFetchableUrl } from "../inspectShared.js";

describe("assertFetchableUrl SSRF guard", () => {
  it("accepts http(s) URLs by default", () => {
    expect(() => assertFetchableUrl("https://example.com/foo")).not.toThrow();
    expect(() => assertFetchableUrl("http://example.com:8080/")).not.toThrow();
  });

  it("rejects non-http(s) schemes regardless of options", () => {
    expect(() => assertFetchableUrl("file:///etc/passwd")).toThrow(
      /Only http: and https:/,
    );
    expect(() => assertFetchableUrl("ftp://example.com/")).toThrow(
      /Only http: and https:/,
    );
    expect(() => assertFetchableUrl("gopher://example.com/")).toThrow(
      /Only http: and https:/,
    );
  });

  it("always blocks cloud metadata endpoints", () => {
    expect(() => assertFetchableUrl("http://169.254.169.254/latest/")).toThrow(
      /cloud metadata/,
    );
    expect(() =>
      assertFetchableUrl("http://metadata.google.internal/"),
    ).toThrow(/cloud metadata/);
    expect(() => assertFetchableUrl("http://metadata.goog/")).toThrow(
      /cloud metadata/,
    );
  });

  it("allows loopback / private ranges by default (dev-tool default)", () => {
    expect(() =>
      assertFetchableUrl("http://localhost:3000/"),
    ).not.toThrow();
    expect(() =>
      assertFetchableUrl("http://127.0.0.1:6006/"),
    ).not.toThrow();
    expect(() =>
      assertFetchableUrl("http://192.168.1.10/"),
    ).not.toThrow();
  });

  it("blocks loopback / private ranges when blockLoopback=true", () => {
    expect(() =>
      assertFetchableUrl("http://localhost:3000/", { blockLoopback: true }),
    ).toThrow(/loopback or private IP range/);
    expect(() =>
      assertFetchableUrl("http://127.0.0.1:6006/", { blockLoopback: true }),
    ).toThrow(/loopback or private IP range/);
    expect(() =>
      assertFetchableUrl("http://10.0.0.5/", { blockLoopback: true }),
    ).toThrow(/loopback or private IP range/);
    expect(() =>
      assertFetchableUrl("http://192.168.1.10/", { blockLoopback: true }),
    ).toThrow(/loopback or private IP range/);
    expect(() =>
      assertFetchableUrl("http://172.16.0.1/", { blockLoopback: true }),
    ).toThrow(/loopback or private IP range/);
  });

  it("still allows public hosts when blockLoopback=true", () => {
    expect(() =>
      assertFetchableUrl("https://example.com/", { blockLoopback: true }),
    ).not.toThrow();
  });
});
