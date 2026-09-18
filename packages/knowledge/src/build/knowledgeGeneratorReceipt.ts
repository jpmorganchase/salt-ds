import * as z from "zod/v4";
import { isPortableRepositoryPath } from "../catalog/catalogPortablePath.js";

const sha256Codec = z
  .string()
  .regex(/^sha256:[0-9a-f]{64}$/u, "Expected a SHA-256 digest.");

const portableRepositoryPathCodec = z
  .string()
  .min(1)
  .refine(isPortableRepositoryPath, {
    message: "Expected a portable repository-relative path.",
  });

export const knowledgeGeneratorReceiptCodec = z
  .object({
    schema_version: z.literal("1.1.0"),
    orchestrator: z
      .object({
        path: portableRepositoryPathCodec,
        sha256: sha256Codec,
      })
      .strict(),
    generator_bundle: z
      .object({
        sha256: sha256Codec,
        metafile_sha256: sha256Codec,
      })
      .strict(),
    dependencies: z
      .object({
        sha256: sha256Codec,
        esbuild_entry: portableRepositoryPathCodec,
        esbuild_version: z.string().min(1),
        esbuild_binary: portableRepositoryPathCodec,
        esbuild_binary_sha256: sha256Codec,
        typescript_entry: portableRepositoryPathCodec,
        typescript_version: z.string().min(1),
        tool_snapshot_sha256: sha256Codec,
        tool_snapshot_files: z.number().int().positive(),
      })
      .strict(),
    runtime: z
      .object({
        executable_sha256: sha256Codec,
        version: z.string().min(1),
        versions: z.record(z.string(), z.string()),
        platform: z.string().min(1),
        arch: z.string().min(1),
        exec_argv: z.array(z.string()).length(0),
        environment: z
          .object({
            policy: z.literal("empty"),
          })
          .strict(),
      })
      .strict(),
  })
  .strict();

export type KnowledgeGeneratorReceipt = z.infer<
  typeof knowledgeGeneratorReceiptCodec
>;
