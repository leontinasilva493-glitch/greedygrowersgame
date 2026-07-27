#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const shippedDirectories = ["app", "components", "config", "data", "public"];
const textExtensions = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".svg",
  ".ts",
  ".tsx",
  ".txt",
  ".xml",
]);

const excludedDirectories = new Set([
  ".git",
  ".next",
  "__fixtures__",
  "__snapshots__",
  "node_modules",
]);
const excludedFiles = [/\.(?:test|spec)\.[cm]?[jt]sx?$/i, /\.snap$/i];

const forbiddenPatterns = [
  { label: "old product name", expression: /Crazy Cattle|crazycattle/i },
  { label: "unblocked positioning", expression: /Unblocked|free_unblocked_games/i },
  { label: "old domain", expression: /crazy-cattle\.net/i },
  { label: "old portal copy", expression: /Hot Games|Other Games/i },
  { label: "rating copy", expression: /Rate .*stars|aggregateRating/i },
  { label: "embed route", expression: /\.embed/i },
  { label: "embedded game path", expression: /public[\\/]game/i },
];

function isExcluded(relativePath, directoryEntry) {
  if (directoryEntry.isDirectory()) {
    return excludedDirectories.has(directoryEntry.name);
  }

  return excludedFiles.some((expression) => expression.test(relativePath));
}

async function collectFiles(root, relativeDirectory) {
  const absoluteDirectory = path.join(root, relativeDirectory);
  let entries;

  try {
    entries = await readdir(absoluteDirectory, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }

  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name);

    if (isExcluded(relativePath, entry)) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(root, relativePath)));
      continue;
    }

    if (entry.isFile() && textExtensions.has(path.extname(entry.name))) {
      files.push(relativePath);
    }
  }

  return files;
}

function findMatches(relativePath, content) {
  const matches = [];
  const pathForScan = relativePath.replaceAll("\\", "/");

  for (const pattern of forbiddenPatterns) {
    if (pattern.expression.test(pathForScan)) {
      matches.push(`${pathForScan} [path: ${pattern.label}]`);
    }
  }

  content.split(/\r?\n/u).forEach((line, index) => {
    for (const pattern of forbiddenPatterns) {
      if (pattern.expression.test(line)) {
        matches.push(
          `${pathForScan}:${index + 1} [content: ${pattern.label}]`,
        );
      }
    }
  });

  return matches;
}

async function main() {
  const root = process.cwd();
  const files = (
    await Promise.all(
      shippedDirectories.map((directory) => collectFiles(root, directory)),
    )
  ).flat();
  const matches = [];

  for (const relativePath of files) {
    const content = await readFile(path.join(root, relativePath), "utf8");
    matches.push(...findMatches(relativePath, content));
  }

  if (matches.length > 0) {
    console.error("Brand contamination found in shipped files:");
    matches.forEach((match) => console.error(`- ${match}`));
    process.exitCode = 1;
    return;
  }

  console.log(
    `Brand check passed across ${files.length} shipped text files. Test, spec, snapshot, and fixture files were intentionally excluded.`,
  );
}

await main();
