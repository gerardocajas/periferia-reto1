import { mkdir } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";
import { z } from "zod";

export const LlenarFormularioInput = z.object({
  requestId: z.string().min(1),
  template: z.literal("excel"),
  outputPath: z.string().min(1),
  fields: z.array(
    z.object({
      hoja: z.string().min(1),
      celda_valor: z.string().regex(/^[A-Z]+[1-9][0-9]*$/),
      etiqueta: z.string().min(1),
      valor: z.union([
        z.string(),
        z.number(),
        z.boolean()
      ])
    })
  )
});

export type LlenarFormularioInput =
  z.infer<typeof LlenarFormularioInput>;

export async function llenarFormularioExcel(
  input: LlenarFormularioInput
): Promise<{
  outputPath: string;
  fieldsWritten: number;
}> {
  const data = LlenarFormularioInput.parse(input);

  const workbook = new ExcelJS.Workbook();

  const sheets = new Set(
    data.fields.map((field) => field.hoja)
  );

  for (const sheetName of sheets) {
    workbook.addWorksheet(sheetName);
  }

  for (const field of data.fields) {
    const worksheet = workbook.getWorksheet(field.hoja);

    if (!worksheet) {
      throw new Error(
        `No existe la hoja "${field.hoja}"`
      );
    }

    worksheet.getCell(field.celda_valor).value = field.valor;
  }

  await mkdir(
    path.dirname(data.outputPath),
    { recursive: true }
  );

  await workbook.xlsx.writeFile(data.outputPath);

  return {
    outputPath: data.outputPath,
    fieldsWritten: data.fields.length
  };
}