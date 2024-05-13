const express = require('express');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Ruta para obtener todos los blinks de todos los usuarios
router.get("/", async (req, res) => {
    try {
        let allBlinks = [];

        // Obtener todos los usuarios
        const usersSnapshot = await admin.firestore().collection('users').get();

        // Iterar sobre cada usuario
        usersSnapshot.forEach(userDoc => {
            const userData = userDoc.data();
            if (userData.blinks) {
                // Agregar los blinks del usuario actual a la lista de blinks
                allBlinks = allBlinks.concat(userData.blinks);
            }
        });

        // Devolver todos los blinks como respuesta
        res.json(allBlinks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Ruta para postear un blink
router.post("/", async (req, res) => {
    try {
        const username = req.body.username;
        const message = req.body.message;

        // Validar parámetros obligatorios
        if (!username || !message) {
            return res.status(400).json({ error: "Faltan parámetros obligatorios: username, message" });
        }

        // Buscar al usuario
        const userRef = admin.firestore().collection('users').doc(username);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Generar ID único para el blink
        const blinkId = uuidv4();

        // Agregar el nuevo blink al usuario
        const newBlink = {
            id: blinkId,
            message
        };
        await userRef.update({
            blinks: admin.firestore.FieldValue.arrayUnion(newBlink)
        });

        // Retornar el objeto JSON con la información del blink creado
        res.status(201).json(newBlink);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Ruta para obtener los blinks de un usuario específico
router.get("/:username", async (req, res) => {
    try {
        const username = req.params.username;

        // Buscar al usuario
        const userRef = admin.firestore().collection('users').doc(username);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Devolver los blinks del usuario como respuesta
        const userData = userDoc.data();
        res.json(userData.blinks || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Ruta para editar un blink
router.post("/:blinkId", async (req, res) => {
    try {
        const username = req.body.username;
        const message = req.body.message;
        const blinkId = req.params.blinkId;

        // Validar parámetros obligatorios
        if (!username || !message) {
            return res.status(400).json({ error: "Faltan parámetros obligatorios: username, message" });
        }

        // Buscar al usuario
        const userRef = admin.firestore().collection('users').doc(username);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Buscar el blink dentro de los blinks del usuario
        const userData = userDoc.data();
        const blinkIndex = userData.blinks.findIndex(blink => blink.id === blinkId);
        if (blinkIndex === -1) {
            return res.status(404).json({ message: 'Blink no encontrado' });
        }

        // Actualizar el mensaje del blink
        userData.blinks[blinkIndex].message = message;

        // Actualizar los blinks del usuario en la base de datos
        await userRef.update({ blinks: userData.blinks });

        // Responder con éxito
        res.status(200).json({ message: 'Blink editado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;


