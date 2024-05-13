const express = require('express');
const admin = require('firebase-admin');
const signInRouter = require("./routes/signin");
const logInRouter = require("./routes/login");
const usersRouter = require("./routes/users");
const blinksRouter = require("./routes/blinks");

// Configuración de Firebase Admin SDK
const serviceAccount = require('./serviceAccount/blinkleback-firebase-adminsdk-t340o-2972d4c26e.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const PORT = 3000;
const app = express();

app.get("/", (req, res) => {
  res.send("Blinkle Funcionando :)   /sign     /log     /users   /users/:username   /blinks   /blinks/:username   /blinks/:blinkId  ");
});

app.use("/sign", signInRouter);
app.use("/log", logInRouter);
app.use("/users", usersRouter);
app.use("/blinks", blinksRouter);

app.listen(PORT, () => {
  console.log(`Servidor está vivito y corriendo en ${PORT}`);
});
