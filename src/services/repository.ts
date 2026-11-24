import { readFile } from "node:fs/promises";
import type { MasterData } from "../types/index.js";

export class MasterRepository {
  constructor(private readonly master: MasterData) {}

  getMaster(): MasterData {
    return this.master;
  }

  findByNit(nit: string): MasterData | null {
    return this.master.nit === nit ? this.master : null;
  }

  findByCompanyName(name: string): MasterData | null {
    return this.master.razon_social === name ? this.master : null;
  }

  findByCountry(country: string): MasterData | null {
    return this.master.pais === country ? this.master : null;
  }

  static async fromFile(path: string): Promise<MasterRepository> {
    const content = await readFile(path, "utf8");
    const data = JSON.parse(content) as MasterData;

    return new MasterRepository(data);
  }
}