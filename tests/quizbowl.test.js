const quizbowl = require('../server/quizbowl.js');

const formatted_answer_1 = "<b><u>Manchester</u></b>"
const formatted_answer_2 = "<b><u>damper</u></b>s [or <b><u>dashpot</u></b>s; accept (tuned) mass <b><u>damper</u></b>s]"
const formatted_answer_3 = "Alice <b><u>Munro</u></b> [or Alice Ann <b><u>Munro</u></b> or Alice Ann <b><u>Laidlaw</u></b>] (The first two stories are “The Progress of Love” and “Hateship, Friendship, Courtship, Loveship, Marriage.”)"
const formatted_answer_4 = "<b><u>light pollution</u></b> [accept <b><u>sky glow</u></b> or <b><u>glare</u></b>; prompt on artificial <u>light</u>] (The Znamya project created large mirrors intended to light up the night.)"
const formatted_answer_5 = "<b><u>Sahara</u></b> Desert [or aṣ-<b><u>Ṣaḥrāʾ al-Kubrā</u></b> or <b><u>Aneẓruf</u></b> <b><u>Ameqran</u></b>; accept <b><u>Deshret</u></b>; accept Nilo-<b><u>Saharan</u></b> languages; accept <b><u>Tibesti</u></b> Mountains or <b><u>Tassili</u></b> n’Ajjer or <b><u>Aïr</u></b> Mountains until read; accept the <b><u>Fezzan</u></b> or <b><u>Illizi</u></b> or <b><u>Hoggar</u></b> Mountains or <b><u>Ahaggar</u></b> or <b><u>Tanezrouft</u></b> or <b><u>Grand Erg</u></b> Oriental; accept <b><u>Ténéré</u></b> until “Tenerian”; prompt on <u>Algeria</u> or <u>Chad</u> or <u>Libya</u> or <u>Niger</u> or <u>Egypt</u>; prompt on North <u>Africa</u> or <u>Maghreb</u>]"
const formatted_answer_6 = "<b><u>primatology</u></b> [or word forms; accept any answers about the study of great <b><u>ape</u></b>s, nonhuman <b><u>primate</u></b>s, <b><u>gorilla</u></b>s, <b><u>bonobo</u></b>s, or <b><u>chimp</u></b>anzees; prompt on the study of <u>monkey</u>s or <u>simian</u>s; prompt on word forms of <u>ethology</u>, <u>biology</u>, <u>anthropology</u>, or evolutionary or social <u>psychology</u>; prompt on the study of <u>animal</u>s with “what type of animals?”]"
const formatted_answer_7 = "Heinrich <b><u>Böll</u></b> [or Heinrich Theodor <b><u>Böll</u></b>]";
const formatted_answer_8 = "<b><u>Louis-Philippe</u></b> [or <b><u>Duke d’Orleans</u></b>; prompt on “Citizen King” before mentioned]";

const answer_1 = "Heinrich Böll [or Heinrich Theodor Böll]";
const answer_2 = "primatology [or word forms; accept any answers about the study of great apes, nonhuman primates, gorillas, bonobos, or chimpanzees; prompt on the study of monkeys or simians; prompt on word forms of ethology, biology, anthropology, or evolutionary or social psychology; prompt on the study of animals with “what type of animals?”]"
const answer_3 = "China [or People’s Republic of China; do not accept or prompt on “Republic of China”]";

const tests = [
    // single answerline
    ['accept', formatted_answer_1, 'manchester'],
    ['accept', formatted_answer_1, 'MANCHESTER'],
    ['reject', formatted_answer_1, 'London'],
    
    // multiple answerlines
    ['accept', formatted_answer_2, 'dampers'],
    ['accept', formatted_answer_2, 'dashpot'],
    ['accept', formatted_answer_2, 'tuned mass dampers'],

    // authors and proper names
    ['accept', formatted_answer_3, 'Munro'],
    ['accept', formatted_answer_3, 'Alice Munro'],

    // prompts and multiple underlined words
    ['prompt', formatted_answer_4, 'light'],
    ['accept', formatted_answer_4, 'light pollution'],
    ['reject', formatted_answer_4, 'pollution'],

    // partial underlining and words not underlined
    ['reject', formatted_answer_5, 'Desert'],
    ['accept', formatted_answer_6, 'chimpanzee'],
    ['accept', formatted_answer_6, 'chimp'],

    // special characters (umlaut)
    ['accept', formatted_answer_7, 'boll'],
    ['accept', formatted_answer_7, 'heinrich boll'],
    ['accept', formatted_answer_7, 'Böll'],
    ['accept', formatted_answer_7, 'Heinrich Böll'],

    ['accept', formatted_answer_8, 'Louis-Philippe'],
    ['accept', formatted_answer_8, 'Louis-Phillipe'],
    ['prompt', formatted_answer_8, 'Citizen King'],
    ['reject', formatted_answer_8, 'Louis'],
    ['reject', formatted_answer_8, 'Philippe'],

    ['accept', answer_1, 'boll'],
    ['accept', answer_1, 'heinrich boll'],
    ['accept', answer_1, 'Böll'],
    ['accept', answer_1, 'Heinrich Böll'],

    // unformatted answerlines
    ['reject', answer_2, 'chimp'], // TODO: make this accept
    ['accept', answer_2, 'chimpanzee'],

    // reject clauses that are a subset of acceptable answer
    ['accept', answer_3, 'China'],
    ['accept', answer_3, 'people’s republic of China'],
    ['reject', answer_3, 'republic of china'],
];

let successful = 0, total = 0;
console.log('TESTING quizbowl.checkAnswer()');
tests.forEach(test => {
    const expected = test[0];
    const answerline = test[1];
    const givenAnswer = test[2];
    const result = quizbowl.checkAnswer(answerline, givenAnswer);

    console.assert(expected === result, `expected "${expected}" but got "${result}" for given answer "${givenAnswer}"`);

    total++;
    if (expected === result) successful++;
});

console.log(`${successful}/${total} tests successful`);