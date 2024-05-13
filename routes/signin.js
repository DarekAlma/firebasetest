const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();



router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.post("/", async (req, res) => {
    try {
       
        const db = admin.firestore();
        const username = req.body.username;
        const password = req.body.password;
        const email = req.body.email;

        if (!username || !password || !email) {
            return res.status(400).json({ error: "Faltan parámetros obligatorios: username, password, email" });
        }

        const userRef = db.collection('users').doc(username);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
        }

        // Verificar si hay un usuario con el mismo correo electrónico
        const existingEmail = await db.collection('users').where('email', '==', email).get();
        if (!existingEmail.empty) {
            return res.status(400).json({ message: 'El correo electrónico ya está en uso' });
        }

        // Crear el usuario en Firestore
        await userRef.set({
            username: username,
            email: email,
            password: password,
            blinks: []
        });

        res.status(201).json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

module.exports = router;

