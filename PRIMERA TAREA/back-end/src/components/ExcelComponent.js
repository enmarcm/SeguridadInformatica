import XLSX from "xlsx";

class ExcelComponent {
  /**
   * Lee un archivo Excel.
   * @private
   * @static
   * @param {Object} params - Los parámetros.
   * @param {string} params.filePath - La ruta del archivo a leer.
   * @returns {Object} El objeto workbook.
   */
  static #readFile = ({ filePath }) => XLSX.readFile(filePath);

  /**
   * Crea un archivo Excel.
   * @static
   * @param {Object} params - Los parámetros.
   * @param {string} params.filePath - La ruta del archivo a crear.
   * @param {Array} params.data - Los datos para escribir en el archivo.
   * @param {string} params.nameFile - El nombre del archivo.
   */
  static createFile = ({ filePath, data, nameFile }) => {
    const book = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(book, sheet, nameFile);
    XLSX.writeFile(book, filePath);
  };

  /**
   * Lee una hoja de un archivo Excel.
   * @static
   * @param {Object} params - Los parámetros.
   * @param {string} params.filePath - La ruta del archivo a leer.
   * @param {number} params.indexSheet - El índice de la hoja a leer.
   * @returns {Object} El objeto hoja.
   */
  static readSheet = ({ filePath, indexSheet }) => {
    const workbook = this.#readFile({ filePath });
    const sheetName = workbook.SheetNames[indexSheet];
    return workbook.Sheets[sheetName];
  };

  /**
   * Convierte una hoja de trabajo a JSON.
   * @static
   * @param {Object} params - Los parámetros.
   * @param {Object} params.worksheet - La hoja de trabajo a transformar.
   * @param {Object} [params.options={ header: 1 }] - Las opciones de conversión.
   * @returns {Array} El JSON que representa la hoja de cálculo.
   */
  static convertToJson = ({ worksheet, options = { header: 1 } }) =>
    XLSX.utils.sheet_to_json(worksheet, options);

  /**
   * Lee el índice de una columna en una fila.
   * @static
   * @param {Object} params - Los parámetros.
   * @param {Array} params.rows - Las filas para buscar.
   * @param {string} params.columnName - El nombre de la columna a encontrar.
   * @returns {number} El índice de la columna.
   */
  static readIndexColumn = ({ rows, columnName }) => {
    const column = rows[0].findIndex((col) => col === columnName);
    return column;
  };

  /**
   * Retorna el primer resultado de una columna en un conjunto de filas
   * @static
   * @param {Object} params - Los parametros.
   * @param {Array} params.rows - Las filas a buscar.
   * @param {string} params.columnName - El nombre de la columna a buscar.
   * @param {boolean} [params.isNumber=false] - Tomar unicamente valores numericos.
   * @returns {string|number} El primer resultado.
   */
  static returnFirnResult = ({ rows, columnName, isNumber = false }) => {
    const column = this.readIndexColumn({ rows, columnName });
    const result = rows.slice(1).map((row) => row[column]);

    if (isNumber) {
      return result.find((value) => !isNaN(value));
    }

    return result;
  };
}

export default ExcelComponent;
