export declare function pathExists(targetPath: string): Promise<boolean>;
export declare function getPackageRoot(fromImportMetaUrl: string): string;
export declare function findSaltRepoRoot(start: string): Promise<string | null>;
export declare function toPosixPath(inputPath: string): string;
