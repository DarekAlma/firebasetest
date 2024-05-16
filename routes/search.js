const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

const jwtMiddleware= require('../components/jwtMiddleware');

router.use(jwtMiddleware);

router.get('/:query', async (req, res) => {
    try {
        const db = admin.firestore();
        const query = req.params.query;

        // Verificar si la cadena comienza con el hashtag
        if (!query.startsWith('#')) {
            return res.status(400).json({ error: 'La consulta debe comenzar con un hashtag (#)' });
        }

        // Obtener la palabra/letras después del hashtag
        const hashtag = query.substring(1);
        const allBlinks = [];

        // Obtener todos los usuarios
        const usersSnapshot = await db.collection('users').get();

        // Mapear todas las promesas de obtener blinks para cada usuario
        const promises = usersSnapshot.docs.map(async userDoc => {
            // Obtener la colección de blinks del usuario actual
            const blinksRef = userDoc.ref.collection('blinks');

            // Consultar los blinks del usuario actual que contienen el hashtag
            const snapshot = await blinksRef.where('message', '>=', hashtag).where('message', '<=', hashtag + '\uf8ff').get();

            // Agregar los blinks encontrados al arreglo de todos los blinks
            if (!snapshot.empty) {
                snapshot.forEach(blinkDoc => {
                    allBlinks.push(blinkDoc.data());
                });
            }
        });

        // Esperar la resolución de todas las promesas
        await Promise.all(promises);

        // Enviar los blinks encontrados como respuesta
        res.json(allBlinks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;