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
        let hashtag = '';
        if (query.startsWith('#')) {
            // Si comienza con un hashtag, obtener la palabra/letras después del hashtag
            hashtag = query.substring(1);
        } else {
            // Si no comienza con un hashtag, usar la cadena completa como la consulta
            hashtag = query;
        }

        const allBlinks = [];

        // Consultar la base de datos para obtener los blinks que contienen el hashtag
        const snapshot = await db.collectionGroup('blinks').where('message', '>=', hashtag).where('message', '<=', hashtag + '\uf8ff').get();

        // Agregar los blinks encontrados al arreglo de resultados
        snapshot.forEach(doc => {
            allBlinks.push(doc.data());
        });

        // Verificar si no se encontraron blinks
        if (allBlinks.length === 0) {
            return res.status(404).json({ message: 'No se encontraron tweets que coincidan con la búsqueda.' });
        }

        // Enviar los blinks encontrados como respuesta
        res.json(allBlinks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});


module.exports = router;