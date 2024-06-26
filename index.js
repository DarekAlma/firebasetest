const express = require('express');
const admin = require('firebase-admin');
const signInRouter = require("./routes/signin");
const cors = require('cors'); // Importar el paquete de cors
const logInRouter = require("./routes/login");
const usersRouter = require("./routes/users");
const blinksRouter = require("./routes/blinks");
const searchRouter =require("./routes/search");

// Configuración de Firebase Admin SDK
const serviceAccount = require('./serviceAccount/blinkleback-firebase-adminsdk-t340o-2972d4c26e.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const PORT = 3000;
const app = express();

// Configurar CORS
app.use(cors()); // Agregar esto para habilitar CORS

app.get("/", (req, res) => {
  res.send("Blinkle Funcionando :)   /sign     /log     /users   /users/:username   /blinks   /blinks/:username   /blinks/:blinkId  ");
});

app.use("/sign", signInRouter);
app.use("/log", logInRouter);
app.use("/users", usersRouter);
app.use("/blinks", blinksRouter);
app.use('/',searchRouter);

app.listen(PORT, () => {
  console.log(`Servidor está vivito y corriendo en ${PORT}`);
});
