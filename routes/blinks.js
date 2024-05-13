const express = require('express');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();


router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Ruta para obtener todos los blinks de todos los usuarios
router.get("/", async (req, res) => {
    try {
        const db = admin.firestore();
        const blinksRef = db.collection('blinks');
        const snapshot = await blinksRef.get();
        const blinks = [];
        snapshot.forEach(doc => {
            blinks.push(doc.data());
        });
        res.json(blinks);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

// Ruta para postear un blink
router.post("/", async (req, res) => {
    try {
        const { username, message } = req.body;
        if (!username || !message) {
            return res.status(400).json({ error: "Faltan parámetros obligatorios: username, message" });
        }
        const db = admin.firestore();
        const userRef = db.collection('users').doc(username);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const blinkId = uuidv4();
        const blinkRef = db.collection('blinks').doc(blinkId);
        await blinkRef.set({
            id: blinkId,
            username: username,
            message: message
        });
        res.status(201).json({ id: blinkId, username: username, message: message });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

// Resto de las rutas...

module.exports = router;

