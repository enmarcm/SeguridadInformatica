import path from "node:path";
import CryptManager from "../components/CryptManager.js";
import ExcelComponent from "../components/ExcelComponent.js";
import { getPrivateKey } from "../utils/getPrivateKey.js";

class ExcelController {
  static compareWinner = async (req, res) => {
    const privateKey =
      req.body?.privateKey === "null" || !req.body?.privateKey
        ? await getPrivateKey()
        : req.body?.privateKey;

    const allPrices = [];

    try {
      const decryptPromises = req.files.map(async (file) => {
        const ubication = file.path;
        const originalName = path.basename(ubication, path.extname(ubication));
        const destino = path.join(
          path.dirname(ubication),
          originalName + "Descifrado.xlsx"
        );

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

        const minValue = ExcelComponent.returnFirnResult({
          rows,
          columnName: "precio",
          isNumber: true,
        });

        allPrices.push({ name: originalName, minValue });
      });

      await Promise.all(decryptPromises);

      const minFiles = allPrices.reduce(
        (minFiles, file) => {
          if (file.minValue < minFiles[0].minValue) {
            return [file];
          } else if (file.minValue === minFiles[0].minValue) {
            // Verificamos que el archivo no esté ya en minFiles antes de agregarlo
            if (!minFiles.find((f) => f.name === file.name)) {
              return [...minFiles, file];
            }
          }
          return minFiles;
        },
        [allPrices[0]]
      );

      if (minFiles.some((item) => item === null || item === undefined)) {
        return res.json({ error: "Ocurrió un error, faltan datos" });
      }

      return res.json({ success: minFiles });
    } catch (error) {
      console.error(error);
      return res.json({ error: `Hubo un error ${error}` });
    }
  };
}

export default ExcelController;
