const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

const jwtMiddleware= require('../components/jwtMiddleware');

router.use(jwtMiddleware);

router.get('/search', async (req, res) => {
    try {
        const query = req.query.q; // Obtener la consulta de búsqueda de los parámetros de la URL

        if (!query) {
            return res.status(400).json({ error: 'Debe proporcionar una consulta de búsqueda' });
        }

        const db = admin.firestore();
        const allBlinks = [];

        // Obtener todos los usuarios
        const usersSnapshot = await db.collection('users').get();

        // Mapear todas las promesas de obtener blinks para cada usuario
        const promises = usersSnapshot.docs.map(async userDoc => {
            // Obtener la colección de blinks del usuario actual
            const blinksRef = userDoc.ref.collection('blinks');

            // Consultar los blinks del usuario actual que contienen la consulta
            const snapshot = await blinksRef.where('message', '>=', query).get(); // Quitamos el límite superior

            // Filtrar los blinks que contienen la consulta en cualquier parte del mensaje
            const filteredBlinks = snapshot.docs.filter(doc => doc.data().message.includes(query));

            // Agregar los blinks encontrados al arreglo de todos los blinks
            if (filteredBlinks.length > 0) {
                filteredBlinks.forEach(blinkDoc => {
                    allBlinks.push(blinkDoc.data());
                });
            }
        });

        // Esperar la resolución de todas las promesas
        await Promise.all(promises);

        if (allBlinks.length === 0) {
            return res.status(404).json({ message: 'No se encontraron resultados para la consulta proporcionada' });
        }

        res.json(allBlinks);
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});






module.exports = router;