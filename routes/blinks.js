const express = require('express');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.get("/", async (req, res) => {
    try {
        const db = admin.firestore();
        const usersSnapshot = await db.collection('users').get();
        const allBlinks = [];
        usersSnapshot.forEach(userDoc => {
            const userBlinks = userDoc.data().blinks;
            allBlinks.push(...userBlinks);
        });
        res.json(allBlinks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

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
        const blinkRef = userRef.collection('blinks').doc(blinkId);
        await blinkRef.set({
            id: blinkId,
            message: message
        });
        res.status(201).json({ id: blinkId, username: username, message: message });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

router.get("/:username", async (req, res) => {
    try {
        const username = req.params.username;
        const db = admin.firestore();
        const userRef = db.collection('users').doc(username);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const userBlinksSnapshot = await userRef.collection('blinks').get();
        const userBlinks = [];
        userBlinksSnapshot.forEach(blinkDoc => {
            userBlinks.push(blinkDoc.data());
        });
        res.json(userBlinks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

router.post("/:username/:blinkId", async (req, res) => {
    try {
        const username = req.params.username;
        const blinkId = req.params.blinkId;
        const message = req.body.message;
        if (!message) {
            return res.status(400).json({ error: "Falta el parámetro obligatorio: message" });
        }
        const db = admin.firestore();
        const blinkRef = db.collection('users').doc(username).collection('blinks').doc(blinkId);
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


module.exports = router;
