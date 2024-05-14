const express = require('express');
const admin = require('firebase-admin');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const router = express.Router();


router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Generar una clave secreta única
const secretKey = crypto.randomBytes(32).toString('hex');

router.post("/", async (req, res) => {
    try {
        const db = admin.firestore();
        const password = req.body.password;
        const email = req.body.email;

        if (!password || !email) {
            return res.status(400).json({ error: "Faltan parámetros obligatorios: password, email" });
        }

        const userQuery = await db.collection('users').where('email', '==', email).get();
        if (userQuery.empty) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const userData = userQuery.docs[0].data();
        if (userData.password !== password) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar un token JWT con el nombre de usuario
        const token = jwt.sign({ username: userData.username }, secretKey, { expiresIn: '1h' });

        res.status(200).json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

module.exports = router;
