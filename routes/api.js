const express = require('express');
const router = express.Router();

const database = require('../server/database');

// DO NOT DECODE THE ROOM NAMES - THEY ARE SAVED AS ENCODED

router.get('/num-packets', async (req, res) => {
    req.query.setName = decodeURIComponent(req.query.setName);
    const numPackets = await database.getNumPackets(req.query.setName);
    res.send(numPackets.toString());
});

router.get('/packet', async (req, res) => {
    req.query.setName = decodeURIComponent(req.query.setName);
    req.query.packetNumber = parseInt(decodeURIComponent(req.query.packetNumber));
    const packet = await database.getPacket(req.query.setName, req.query.packetNumber);
    res.send(JSON.stringify(packet));
});

router.get('/packet-bonuses', async (req, res) => {
    req.query.setName = decodeURIComponent(req.query.setName);
    req.query.packetNumber = parseInt(decodeURIComponent(req.query.packetNumber));
    const packet = await database.getPacket(req.query.setName, req.query.packetNumber, ['bonuses']);
    res.send(JSON.stringify(packet));
});

router.get('/packet-tossups', async (req, res) => {
    req.query.setName = decodeURIComponent(req.query.setName);
    req.query.packetNumber = parseInt(decodeURIComponent(req.query.packetNumber));
    const packet = await database.getPacket(req.query.setName, req.query.packetNumber, ['tossups']);
    res.send(JSON.stringify(packet));
});

router.get('/random-name', (req, res) => {
    res.send(database.getRandomName());
});

/** 
router.post('/random-question', async (req, res) => {
    if (req.body.type !== 'tossup' && req.body.type !== 'bonus') {
        res.status(400).send('Invalid question type specified.');
    }

    if (req.body.difficulty === undefined) {
        req.body.difficulty = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }
    if (req.body.category === undefined) {
        req.body.category = CATEGORIES;
    }
    if (typeof req.body.difficulty === 'number' || typeof req.body.difficulty === 'string') {
        req.body.difficulty = [req.body.difficulty];
    }
    if (typeof req.body.category === 'string') {
        req.body.category = [req.body.category];
    }
    const question = await database.getRandomQuestion(req.body.type, req.body.difficulty, req.body.category);
    res.send(JSON.stringify(bonus));
});
*/

router.post('/report-question', async (req, res) => {
    const _id = req.body._id;
    const successful = await database.reportQuestion(_id);
    if (successful) {
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
})

router.get('/set-list', (req, res) => {
    const setList = database.getSetList(req.query.setName);
    res.send(setList);
})

module.exports = router;