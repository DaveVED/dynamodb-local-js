import { Glob, $ } from "bun";

await $`rm -rf dist`;

const files = new Glob("./src/**/*.{ts,tsx}").scan() as AsyncIterable<string>;
const collectedFiles: string[] = [];
for await (const file of files) {
  collectedFiles.push(file);
}

await Bun.build({
  format: "esm",
  outdir: "dist/esm",
  external: ["*"],
  root: "src",
  /**
   * My understanding is it's better to pass all the files in at once
   * instead of building each file individually.
   */
  entrypoints: collectedFiles,
});

// Generate type declarations
await $`tsc --outDir dist/types --declaration --emitDeclarationOnly --declarationMap`;
