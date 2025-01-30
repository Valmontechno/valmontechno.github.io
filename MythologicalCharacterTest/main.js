const credits = `\
jQuery v3.6.0 | (c) OpenJS Foundation and other contributors | jquery.org/license

UI Audio Collection for Unity devsdaddy.itch.io/ui-audio-collection-for-unity

Images via Wikimedia Commons`

const questionsRequest = $.getJSON('questions.json');
const charactersRequest = $.getJSON('characters.json');

var questions = null;
var characters = null;

const container = $('.container');
const questionStatement = $('.quiz .question');
const answersDiv = $('.quiz .answers');

$(document).ready(() => {
    $.when(questionsRequest, charactersRequest).done((questionsData, charactersData) => {
        questions = questionsData[0];
        characters = charactersData[0];
        init();
        
        $('.start-button').click(start);
        $('.restart-button').click(restart);
        $('.credits-button').click(e => {
            alert(credits);
        });
    });
});

const answerSounds = [
    new Audio('sounds/Collect_Boxy_3.wav'),
    new Audio('sounds/Collect_Boxy_1.wav'),
    new Audio('sounds/Collect_Boxy_2.wav'),
    new Audio('sounds/Collect_Pop_2.wav')
];

const resultSound = new Audio('sounds/Success_9.wav');

var questionOrder = []
var scores = {};

function fadeIn(element, callback, duration = 500) {
    element.fadeIn(duration, () => {
        container.removeClass('disabled');
        callback?.();
    });
}

function fadeOut(element, callback, duration = 500) {
    container.addClass('disabled');
    element.fadeOut(duration, () => {
        callback?.();
    });
}

function opacityIn(element, callback, duration = 500) {
    element.animate(
        {opacity: 1},
        {
            duration,
            complete: callback
        }
    )
}

function opacityOut(element, callback, duration = 500) {
    element.animate(
        {opacity: 0},
        {
            duration,
            complete: callback
        }
    )
}

function init() {
    questions.forEach(question => {
        const localScoreMax = {}
        question.answers.forEach(answer => {
            answer.characters.forEach(character => {
                localScoreMax[character[0]] = Math.max(localScoreMax[character[0]] || 0, character[1]);
            });
        });
        Object.entries(localScoreMax).forEach(([character, scoreMax]) => {
            characters[character] = characters[character] || {};
            characters[character].scoreMax = (characters[character]?.scoreMax || 0) + scoreMax;
        });
    });
}

function start() {
    fadeOut($('.home'), () => {

        questionStatement.text('\u00A0');
        answersDiv.empty();
        fadeIn($('.quiz'));

        questionOrder = Array.from({length: questions.length}, (_, i) => i);
        questionOrder = questionOrder.sort(() => Math.random() - 0.5);
        scores = {};

        nextQuestion();
    });
}

function nextQuestion() {
    if (questionOrder.length > 0) {
        askQuestion(questionOrder.shift());
    } else {
        result();
    }
}

function askQuestion(questionIndex) {
    const question = questions[questionIndex];

    fadeOut(answersDiv, () => {
        questionStatement.text(question.question.replace(/ (\:|\!|\?)/g, '\u00A0$1'));

        answersDiv.empty();
        question.answers = question.answers.sort(() => Math.random() - 0.5);
        question.answers.forEach((answer, answerIndex) => {
            const button = $('<button></button>');
            button.text(answer.label);
            button.click(() => {
                container.addClass('disabled');
                button.addClass('clicked');
                answerSounds[answerIndex % 4].play();
                setTimeout(() => {
                    onAnswer(answer)
                }, 1000);
            });
            answersDiv.append(button);
        });

        fadeIn(answersDiv);
    });
}

function onAnswer(answer) {
    answer.characters.forEach(character => {
        scores[character[0]] = (scores[character[0]] || 0) + character[1];
    });
    nextQuestion();
}

function result() {
    const matchs = []
    for (let id in scores) {
        matchs.push([
            id,
            Math.ceil(Math.pow(scores[id] / characters[id].scoreMax, 0.7) * 100),
            scores[id] / characters[id].scoreMax * 100
        ]);
    }
    matchs.sort((a, b) => b[1] - a[1]);
    console.log(matchs);

    const characterId = matchs[0][0];
    const match = matchs[0][1]
    const character = characters[characterId];

    console.log(match);
    
    $('.character-greek-name').text(character?.greekName || characterId);
    $('.character-roman-name').text(character?.romanName || characterId);
    $('.character-description').text(character?.description || 'Description.');
    $('.character-image').attr('src', character?.image || 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg')
                         .attr('title', character?.imageCredit);

    $('.progress-indicator').text('0 %');
    $('.progress-bar span').css('width', '0%');
    $('.character').css('opacity', 0)

    fadeOut($('.quiz'), () => {
        container.addClass('maximized');

        fadeIn($('.result'), () => {

            container.removeClass('disabled');
            resultSound.play();

            $({progress: 0}).animate(
                {progress: match},
                {
                    duration: 1500,
                    easing: "swing",
                    step: (now) => {
                        $('.progress-indicator').text(Math.round(now) + ' %');
                        $('.progress-bar span').css('width', now + '%');
                    }
                }
            )

            setTimeout(() => {
                opacityIn($('.character'), null, 1000);
            }, 1000)

        });
    });
}

function restart() {
    fadeOut($('.result'), () => {
        container.removeClass('maximized');
        $('.progress').css('--match', '0%');
        fadeIn($('.home'));
    });
}

console.log(
    '%c Oel ngati kameie',
    'color: #00d8d5; background: #002f33; font-size: 20px; font-family: "Papyrus", "Comic Sans MS", sans-serif; padding: 10px 20px; border: 2px solid #00d8d5; border-radius: 5px; text-shadow: 2px 2px 4px #004f55;'
);