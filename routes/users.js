const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

const jwtMiddleware= require('../components/jwtMiddleware');

router.use(jwtMiddleware);



router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Ruta para obtener todos los usuarios
router.get("/", async (req, res) => {
    try {
        const db = admin.firestore();
        const usersRef = db.collection('users');
        const snapshot = await usersRef.get();
        const users = [];
        snapshot.forEach(doc => {
            users.push(doc.data());
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

// Ruta para obtener un usuario específico
router.get("/:username", async (req, res) => {
    try {
        const username = req.params.username;
        const db = admin.firestore();
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('username', '==', username).get();
        if (snapshot.empty) {
            res.status(404).json({ message: 'Usuario no encontrado' });
        } else {
            snapshot.forEach(doc => {
                res.json(doc.data());
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

module.exports = router;

