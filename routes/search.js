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

        // Obtener todos los blinks que contienen la letra o palabra en el mensaje
        const allBlinks = [];

        // Consultar los blinks de todos los usuarios que contienen la letra o palabra en el mensaje
        const snapshot = await db.collectionGroup('blinks').where('message', '>=', query).where('message', '<=', query + '\uf8ff').get();

        // Iterar sobre los documentos de los blinks encontrados
        snapshot.forEach(doc => {
            // Agregar cada documento de blink al arreglo de todos los blinks
            allBlinks.push(doc.data());
        });

        // Enviar los blinks encontrados como respuesta
        res.json(allBlinks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});



module.exports = router;