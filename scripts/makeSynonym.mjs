/**
 * A small script to convert our Synonym Excel file into a JSON format for the site.
 */

import * as fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Biome } from "@biomejs/js-api/nodejs";
import * as XLSX from "xlsx/xlsx.mjs";

XLSX.set_fs(fs);

const biome = new Biome();

const project = biome.openProject();

biome.applyConfiguration(project.projectKey, {
  assist: { actions: { source: { organizeImports: "on" } } },
  formatter: {
    enabled: true,
    indentStyle: "space",
  },
});

function biomeFormat(content, filePath) {
  const formattedResult = biome.formatContent(project.projectKey, content, {
    filePath: filePath,
  });

  // Linting is needed to sort imports.
  const result = biome.lintContent(
    project.projectKey,
    formattedResult.content,
    {
      filePath: filePath,
      fixFileMode: "safeFixes",
    },
  );

  return result.content;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Example usage
const filePath = path.join(__dirname, "Icons Synonym List.xlsx"); // Replace with your Excel file path
// Read the Excel file
const workbook = XLSX.readFile(filePath);

// Get the first sheet name
const sheetName = workbook.SheetNames[0];

// Get the worksheet
const worksheet = workbook.Sheets[sheetName];

// Convert the worksheet to JSON
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: "A" });

const output = [];

function getSynonymFromRow(row) {
  const synonyms = new Set();
  if (row["C"]) synonyms.add(row["C"].trim());
  if (row["D"]) synonyms.add(row["D"].trim());
  if (row["E"]) synonyms.add(row["E"].trim());
  if (row["F"]) row["F"].split(",").forEach((s) => synonyms.add(s.trim()));
  if (row["G"])
    synonyms.add(row["G"].split("/")[1].replaceAll("_", " ").trim());
  if (row["H"]) synonyms.add(row["H"].replaceAll("-", " ").trim());

  return Array.from(synonyms).filter((s) => s !== "" && s !== row["A"].trim());
}

// remove headers

jsonData.shift();

for (const row of jsonData) {
  if (row["A"]) {
    output.push({
      iconName: row["A"].trim(),
      synonym: getSynonymFromRow(row),
      category: row["I"],
    });
  }
}

const fileLocation = path.join(
  __dirname,
  "../site/src/components/icon-preview/salt-icon-synonym.json",
);
const fileContent = biomeFormat(JSON.stringify(output), fileLocation);

fs.writeFile(fileLocation, fileContent, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
