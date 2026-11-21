// Vice Cover Studio — hand-in program for the gta6-cover-art-01 bounty.
// Copies the static app and its screenshots into the output directory and
// writes the dossier the judge reads, using the kit's own library so the
// bytes match the scorer's rebuild exactly.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-app.ts";

const rootDir = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// The gate's own caps, so the dossier written here is the dossier the
// scorer rebuilds from the same files.
const gateCaps = {
  text_max_bytes: 163_840,
  screenshots: { max: 4, max_bytes: 256 * 1024 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function handIn(): void {
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(rootDir, "app"), join(outputDir, "app"), { recursive: true });
  cpSync(join(rootDir, "screenshots"), join(outputDir, "screenshots"), {
    recursive: true,
  });
  const dossier = buildDossier(outputDir, gateCaps);
  writeFileSync(join(outputDir, "dossier.json"), dossier);
  console.log(`handed in app/ and screenshots/ to ${outputDir} with a ${dossier.length}-byte dossier`);
}

handIn();
