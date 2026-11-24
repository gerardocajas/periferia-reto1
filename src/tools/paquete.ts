import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import {
  mkdir,
  readFile,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import archiverModule = require("archiver");
import { z } from "zod";

export const ConstruirPaqueteInput = z.object({
  requestId: z.string().min(1),
  documentos: z.array(z.string().min(1)).min(1),
  outputDir: z.string().min(1),
});

export type ConstruirPaqueteInput = z.infer<
  typeof ConstruirPaqueteInput
>;

export interface ManifestEntry {
  archivo: string;
  sha256: string;
  bytes: number;
}

export interface PaqueteResult {
  requestId: string;
  outputPath: string;
  manifestPath: string;
  archivos: ManifestEntry[];
}

async function sha256File(
  filePath: string,
): Promise<{ sha256: string; bytes: number }> {
  const content = await readFile(filePath);

  return {
    sha256: createHash("sha256")
      .update(content)
      .digest("hex"),
    bytes: content.length,
  };
}

function safeArchiveName(filePath: string): string {
  const normalized = path
    .relative(process.cwd(), path.resolve(filePath))
    .replaceAll("\\", "/");

  if (
    normalized.startsWith("../") ||
    normalized === ".." ||
    path.isAbsolute(normalized)
  ) {
    throw new Error(
      `Ruta de documento no permitida: ${filePath}`,
    );
  }

  return normalized;
}

export async function construirPaquete(
  input: ConstruirPaqueteInput,
): Promise<PaqueteResult> {
  const data = ConstruirPaqueteInput.parse(input);

  await mkdir(data.outputDir, { recursive: true });

  const archivos: ManifestEntry[] = [];

  for (const documento of data.documentos) {
    const absolutePath = path.resolve(documento);
    const fileStat = await stat(absolutePath);

    if (!fileStat.isFile()) {
      throw new Error(
        `El documento no es un archivo: ${documento}`,
      );
    }

    const hash = await sha256File(absolutePath);

    archivos.push({
      archivo: safeArchiveName(absolutePath),
      sha256: hash.sha256,
      bytes: hash.bytes,
    });
  }

  const manifest = {
    requestId: data.requestId,
    generadoEn: new Date().toISOString(),
    algoritmo: "SHA-256",
    archivos,
  };

  const manifestPath = path.join(
    data.outputDir,
    "manifest.json",
  );

  await writeFile(
    manifestPath,
    JSON.stringify(manifest, null, 2),
    "utf8",
  );

  const outputPath = path.join(
    data.outputDir,
    "paquete-final.zip",
  );

  await new Promise<void>((resolve, reject) => {
    const output = createWriteStream(outputPath);

   const archive = archiverModule("zip", {
      zlib: { level: 9 },
    });

    output.on("close", () => resolve());
    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);

    for (const documento of data.documentos) {
      const absolutePath = path.resolve(documento);

      archive.append(createReadStream(absolutePath), {
        name: safeArchiveName(absolutePath),
      });
    }

    archive.file(manifestPath, {
      name: "manifest.json",
    });

    void archive.finalize();
  });

  return {
    requestId: data.requestId,
    outputPath,
    manifestPath,
    archivos,
  };
}