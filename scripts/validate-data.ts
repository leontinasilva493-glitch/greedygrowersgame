import path from "node:path";

import { loadDataBundle } from "../features/data/repository";

const directory = path.join(process.cwd(), "data");

async function main() {
  try {
    await loadDataBundle(directory);
    console.log(`Validated canonical data in ${directory}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

void main();
