import { z } from "zod";
export declare const diagnosticStatusSchema: z.ZodEnum<{
  pass: "pass";
  warn: "warn";
  fail: "fail";
  info: "info";
}>;
export declare const artifactDescriptorSchema: z.ZodObject<
  {
    kind: z.ZodString;
    path: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export declare const doctorCheckSchema: z.ZodObject<
  {
    id: z.ZodString;
    status: z.ZodEnum<{
      pass: "pass";
      warn: "warn";
      fail: "fail";
      info: "info";
    }>;
    summary: z.ZodString;
    details: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export declare const saltPackageDescriptorSchema: z.ZodObject<
  {
    name: z.ZodString;
    version: z.ZodString;
  },
  z.core.$strip
>;
export declare const doctorResultSchema: z.ZodObject<
  {
    toolVersion: z.ZodString;
    timestamp: z.ZodString;
    rootDir: z.ZodString;
    environment: z.ZodObject<
      {
        os: z.ZodString;
        nodeVersion: z.ZodString;
        packageManager: z.ZodString;
      },
      z.core.$strip
    >;
    saltPackages: z.ZodArray<
      z.ZodObject<
        {
          name: z.ZodString;
          version: z.ZodString;
        },
        z.core.$strip
      >
    >;
    repoSignals: z.ZodObject<
      {
        storybookDetected: z.ZodBoolean;
        appRuntimeDetected: z.ZodBoolean;
        saltTeamConfigFound: z.ZodBoolean;
        saltStackConfigFound: z.ZodBoolean;
      },
      z.core.$strip
    >;
    checks: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          status: z.ZodEnum<{
            pass: "pass";
            warn: "warn";
            fail: "fail";
            info: "info";
          }>;
          summary: z.ZodString;
          details: z.ZodOptional<z.ZodString>;
        },
        z.core.$strip
      >
    >;
    artifacts: z.ZodArray<
      z.ZodObject<
        {
          kind: z.ZodString;
          path: z.ZodString;
          label: z.ZodOptional<z.ZodString>;
        },
        z.core.$strip
      >
    >;
    redactionsApplied: z.ZodBoolean;
  },
  z.core.$strip
>;
export declare const runtimeErrorSchema: z.ZodObject<
  {
    kind: z.ZodString;
    level: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
  },
  z.core.$strip
>;
export declare const roleSummarySchema: z.ZodObject<
  {
    role: z.ZodString;
    name: z.ZodString;
    count: z.ZodOptional<z.ZodNumber>;
  },
  z.core.$strip
>;
export declare const runtimeInspectResultSchema: z.ZodObject<
  {
    toolVersion: z.ZodString;
    timestamp: z.ZodString;
    target: z.ZodObject<
      {
        url: z.ZodString;
      },
      z.core.$strip
    >;
    page: z.ZodObject<
      {
        title: z.ZodString;
        loadState: z.ZodString;
      },
      z.core.$strip
    >;
    errors: z.ZodArray<
      z.ZodObject<
        {
          kind: z.ZodString;
          level: z.ZodOptional<z.ZodString>;
          message: z.ZodString;
        },
        z.core.$strip
      >
    >;
    accessibility: z.ZodObject<
      {
        roles: z.ZodArray<
          z.ZodObject<
            {
              role: z.ZodString;
              name: z.ZodString;
              count: z.ZodOptional<z.ZodNumber>;
            },
            z.core.$strip
          >
        >;
        landmarks: z.ZodArray<
          z.ZodObject<
            {
              role: z.ZodString;
              name: z.ZodString;
              count: z.ZodOptional<z.ZodNumber>;
            },
            z.core.$strip
          >
        >;
      },
      z.core.$strip
    >;
    structure: z.ZodObject<
      {
        summary: z.ZodArray<z.ZodString>;
      },
      z.core.$strip
    >;
    screenshots: z.ZodArray<
      z.ZodObject<
        {
          path: z.ZodString;
          label: z.ZodString;
        },
        z.core.$strip
      >
    >;
    artifacts: z.ZodArray<
      z.ZodObject<
        {
          kind: z.ZodString;
          path: z.ZodString;
          label: z.ZodOptional<z.ZodString>;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$strip
>;
export type DiagnosticStatus = z.infer<typeof diagnosticStatusSchema>;
export type ArtifactDescriptor = z.infer<typeof artifactDescriptorSchema>;
export type DoctorCheck = z.infer<typeof doctorCheckSchema>;
export type SaltPackageDescriptor = z.infer<typeof saltPackageDescriptorSchema>;
export type DoctorResult = z.infer<typeof doctorResultSchema>;
export type RuntimeErrorRecord = z.infer<typeof runtimeErrorSchema>;
export type RoleSummary = z.infer<typeof roleSummarySchema>;
export type RuntimeInspectResult = z.infer<typeof runtimeInspectResultSchema>;
export declare function parseDoctorResult(value: unknown): DoctorResult;
export declare function parseRuntimeInspectResult(
  value: unknown,
): RuntimeInspectResult;
