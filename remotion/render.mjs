import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function render() {
  console.log("Bundling Remotion project...");
  const bundled = await bundle({
    entryPoint: path.join(__dirname, "index.ts"),
    webpackOverride: (config) => config,
  });

  console.log("Selecting composition...");
  const composition = await selectComposition({
    serveUrl: bundled,
    id: "DemoVideo",
  });

  console.log("Rendering video...");
  const outputPath = path.join(__dirname, "..", "public", "demo.mp4");

  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: outputPath,
  });

  console.log(`Video rendered to: ${outputPath}`);
}

render().catch((err) => {
  console.error(err);
  process.exit(1);
});
