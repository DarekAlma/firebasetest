const express = require('express');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Ruta para obtener todos los blinks
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

// Ruta para obtener todos los blinks de un usuario específico
router.get("/:username", async (req, res) => {
    try {
        const username = req.params.username;
        const db = admin.firestore();
        const userRef = db.collection('users').doc(username);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const userBlinksRef = db.collection('blinks').where('username', '==', username);
        const snapshot = await userBlinksRef.get();
        const userBlinks = [];
        snapshot.forEach(doc => {
            userBlinks.push(doc.data());
        });
        res.json(userBlinks);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});


// Ruta para editar un blink por su ID
router.put("/:blinkId", async (req, res) => {
    try {
        const blinkId = req.params.blinkId;
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Falta el parámetro obligatorio: message" });
        }
        const db = admin.firestore();
        const blinkRef = db.collection('blinks').doc(blinkId);
        const blinkDoc = await blinkRef.get();
        if (!blinkDoc.exists) {
            return res.status(404).json({ message: 'Blink no encontrado' });
        }
        await blinkRef.update({ message: message });
        res.status(200).json({ message: 'Blink editado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

// Ruta para eliminar un blink por su ID
router.delete("/:blinkId", async (req, res) => {
    try {
        const blinkId = req.params.blinkId;
        const db = admin.firestore();
        const blinkRef = db.collection('blinks').doc(blinkId);
        const blinkDoc = await blinkRef.get();
        if (!blinkDoc.exists) {
            return res.status(404).json({ message: 'Blink no encontrado' });
        }
        await blinkRef.delete();
        res.status(200).json({ message: 'Blink eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

module.exports = router;
