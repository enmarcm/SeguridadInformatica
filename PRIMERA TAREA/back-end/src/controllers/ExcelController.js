import path from "node:path";
import CryptManager from "../components/CryptManager.js";
import ExcelComponent from "../components/ExcelComponent.js";
import { getPrivateKey } from "../utils/getPrivateKey.js";


class ExcelController {
  static compareWinner = async (req, res) => {
    const privateKey = req.body?.privateKey === "null" || !req.body?.privateKey ? await getPrivateKey() : req.body?.privateKey;

    try {
      const allPrices = await Promise.all(req.files.map(file => this.#processFile(file, privateKey)));

      const errorFile = allPrices.find(file => file.error);
      if (errorFile) {
        return res.json({ error: errorFile.error });
      }

      const minFiles = allPrices.reduce(this.#reduceFiles, [allPrices[0]]);

      if (minFiles.some(item => item === null || item === undefined)) {
        return res.json({ error: "Ocurrió un error, faltan datos" });
      }

      return res.json({ success: minFiles });
    } catch (error) {
      console.error(error);
      return res.json({ error: `Hubo un error ${error}` });
    }
  };

  static #processFile = async (file, privateKey) => {
    try {
      const ubication = file.path;
      const originalName = path.basename(ubication, path.extname(ubication));
      const destino = path.join(path.dirname(ubication), originalName + "Descifrado.xlsx");

      await CryptManager.privateFileDecrypt({
        filePath: ubication,
        routeFinal: destino,
        privateKey,
      });

      const sheets = ExcelComponent.readSheet({
        filePath: destino,
        indexSheet: 0,
      });

      const rows = ExcelComponent.convertToJson({ worksheet: sheets });
      console.log(rows)

      const minValue = ExcelComponent.returnFirnResult({
        rows,
        columnName: "precio",
        isNumber: true,
      });

      return { name: originalName, minValue };
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error(`No se pudo encontrar o abrir el archivo en la ubicación especificada: ${error.path}`);
        return { error: `Alguno de los datos son incorrectos` };
      } else {
        console.error(`Ocurrió un error: ${error}`);
        return { error: `Ocurrió un error: ${error}` };
      }
    }
  };
  
  //Obtener el valor minimo o los valores minimos
  static #reduceFiles = (minFiles, file) => {
    if (file.minValue < minFiles[0].minValue) {
      return [file];
    } else if (file.minValue === minFiles[0].minValue && !minFiles.find(f => f.name === file.name)) {
      return [...minFiles, file];
    }
    return minFiles;
  };
}

export default ExcelController;