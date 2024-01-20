/**
 * @file Archivo principal de la aplicación.
 * @description Este es un servidor desarrollado en node.js con Express, contiene un conjunto de librerias propias y una arquitectura ya definida
 * @author Enmanuel Colina <theenmanuel123@gmail.com>
 */

import express from "express";
import picocolors from "picocolors";
import iSession from "./data/session-data/iSession.js";
import {
  midCors,
  midJson,
  midNotFound,
  cors,
} from "./middlewares/middlewares.js";
import iHttps from "./data/https-data/iHttps.js";

/**
 * Puerto en el que se iniciará el servidor.
 * @type {number}
 */
const PORT = process.env.PORT ?? 7878;

/**
 * Instancia de la aplicación Express.
 * @type {express.Application}
 */
const app = express();

// Configuración de middlewares y routers.
app.use(midCors);
app.use(cors({ credentials: true, origin: true })); // <-- Se agrego para Navegador WEB
app.use(iSession.loadSession);
app.use(express.json());
app.use(midJson); // <-- Se agrego para manejar excepciones de JSON en formato incorrecto

//*
//? Desde aqui colocamos los routers
app.get("/", (req, res) => {
  console.log(req?.session);
  // return res.json({"message": 'prueba de envio'});
  return res.send('<h1>Hola Mundo "Seguro"</h1>')
});
//*

app.use(midNotFound);

/**
 * Función que se ejecuta cuando el servidor está escuchando en el puerto especificado.
 * @function
 * @returns {void}
 */
const listenServer = () =>
  console.log(
    picocolors.bgWhite(
      picocolors.black(`El servidor esta iniciado en el PUERTO ${PORT}...`)
    )
  );


//* Inicio del servidor
iHttps.listenServer({ app, listen: listenServer, PORT });
