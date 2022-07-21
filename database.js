const dljs = require('damerau-levenshtein-js');
const fs = require('fs');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const { MongoClient, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME || 'geoffreywu42'}:${process.env.MONGODB_PASSWORD || 'password'}@qbreader.0i7oej9.mongodb.net/?retryWrites=true&w=majority`;

var DATABASE;
var SETS;
var PACKETS;
var QUESTIONS;

const client = new MongoClient(uri);
client.connect().then(async () => {
    console.log('connected to mongodb');

    DATABASE = client.db('qbreader');
    SETS = DATABASE.collection('sets');
    PACKETS = DATABASE.collection('packets');
    QUESTIONS = DATABASE.collection('questions'); 
});

const CATEGORIES = ["Literature", "History", "Science", "Fine Arts", "Religion", "Mythology", "Philosophy", "Social Science", "Current Events", "Geography", "Other Academic", "Trash"]
const SUBCATEGORIES = [
    ["American Literature", "British Literature", "Classical Literature", "European Literature", "World Literature", "Other Literature"],
    ["American History", "Ancient History", "European History", "World History", "Other History"],
    ["Biology", "Chemistry", "Physics", "Math", "Other Science"],
    ["Visual Fine Arts", "Auditory Fine Arts", "Other Fine Arts"]
]
const METAWORDS = ["the", "like", "descriptions", "description", "of", "do", "not", "as", "accept", "or", "other", "prompt", "on", "except", "before", "after", "is", "read", "stated", "mentioned", "at", "any", "time", "don't", "more", "specific", "etc", "eg", "answers", "word", "forms"];


function checkAnswerCorrectness(answer, givenAnswer) {
    answer = answer.toLowerCase().trim();
    givenAnswer = givenAnswer.toLowerCase().trim();

    if (answer.length === 0 || givenAnswer.length === 0) {
        return false;
    }

    let answerTokens = answer.split(' ');
    let givenAnswerTokens = givenAnswer.split(' ');

    for (let i = 0; i < givenAnswerTokens.length; i++) {
        if (givenAnswerTokens[i].length <= 2) return false;

        // if given answer token matches any word in the answerline
        for (let j = 0; j < answerTokens.length; j++) {
            if (METAWORDS.includes(answerTokens[j])) {
                console.log(answerTokens[j]);
                continue;
            }
            if (answerTokens[j].length === 1) continue;
            if (dljs.distance(givenAnswerTokens[i], answerTokens[j]) <= 1) {
                return true;
            }
        }
    }

    return false;
}

async function getNextQuestion(setName, packetNumbers, currentQuestionNumber, validCategories, validSubcategories, type = ['tossup']) {
    setName = setName.replace(/\s/g, '-');
    let set = await SETS.findOne({ name: setName });
    if (validCategories.length === 0) {
        validCategories = CATEGORIES;
    }

    let question = await QUESTIONS.find({
        $or: [
            {
                set: set._id,
                category: { $in: validCategories },
                // subcategory: { $in: validSubcategories },
                packetNumber: packetNumbers[0],
                questionNumber: { $gt: currentQuestionNumber },
                type: { $in: type }
            },
            {
                set: set._id,
                category: { $in: validCategories },
                // subcategory: { $in: validSubcategories },
                packetNumber: { $in: packetNumbers.slice(1) },
                type: { $in: type }
            },
        ]
    }, {
        sort: { packetNumber: 1, questionNumber: 1 }
    });

    return question || {};
}

async function getNumPackets(setName) {
    setName = setName.replace(/\s/g, '-');
    return await SETS.findOne({ name: setName }).then(set => {
        if (set) {
            return set.packets.length;
        } else {
            return 0;
        }
    });
}

/**
 * @param {String} setName 
 * @param {Number} packetNumber - 1-indexed packket number
 * @returns {{tosssups: Array<JSON>, bonuses: Array<JSON>}}
 */
 async function getPacket(setName, packetNumber) {
    setName = setName.replace(/\s/g, '-');
    return await SETS.findOne({ name: setName }).then(async set => {
        let packetId = set.packets[packetNumber - 1];
        let packet = await PACKETS.findOne({ _id: packetId });
        return {
            tossups: await QUESTIONS.find({ _id: { $in: packet.tossups } }, { sort: { questionNumber: 1 } }).toArray(),
            bonuses: await QUESTIONS.find({ _id: { $in: packet.bonuses } }, { sort: { questionNumber: 1 } }).toArray()
        }
    }).catch(err => {
        console.log(err);
        return { 'tossups': [], 'bonuses': [] };
    });
}

/**
* @param {JSON} question 
* @param {Array<String>} validCategories
* @param {Array<String>} validSubcategories
* @returns {boolean} Whether or not the question is part of the valid category and subcategory combination.
*/
function isValidCategory(question, validCategories, validSubcategories) {
    if (validCategories.length === 0 && validSubcategories.length === 0) return true;

    // check if the subcategory is explicitly included (overrides missing category)
    if (question.subcategory && validSubcategories.includes(question.subcategory)) return true;

    // check if category is excluded (and subcategory is excluded)
    if (!validCategories.includes(question['category'])) return false;

    // at this point, the question category is included in the list of valid categories 
    // check for the case where none of the subcategories are selected but the category is;
    // in which case, the question is valid
    if (!question.subcategory) return true;

    // check to see if the category has no corresponding subcategories
    let index = CATEGORIES.indexOf(question['category']);
    if (!(index in SUBCATEGORIES)) return true;

    // check to see if none of the subcategories of the question are selected
    for (let i = 0; i < SUBCATEGORIES[index].length; i++) {
        if (validSubcategories.includes(SUBCATEGORIES[index][i])) return false;
    }

    // if there are no subcategories selected in the field, then it is valid
    return true;
}

module.exports = { checkAnswerCorrectness, getNextQuestion, getNumPackets, getPacket };