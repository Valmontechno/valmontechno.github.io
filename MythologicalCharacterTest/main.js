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
        
        $('.start-button').click(start);
        $('.restart-button').click(restart);
        $('.credits-button').click(e => {
            alert($(e.target).data().credits);
        });
    });
});

const answerSounds = [
    new Audio('sounds/Collect_Boxy_3.wav'),
    new Audio('sounds/Collect_Boxy_1.wav'),
    new Audio('sounds/Collect_Boxy_2.wav'),
    new Audio('sounds/Collect_Pop_2.wav')
];

const resultSound = new Audio('Success_9.wav');

var questionOrder = []
var scores = {};

function fadeIn(element, callback) {
    element.fadeIn(500, () => {
        container.removeClass('disabled');
        callback?.();
    });
}

function fadeOut(element, callback) {
    container.addClass('disabled');
    element.fadeOut(500, () => {
        callback?.();
    });
}

function start() {
    fadeOut($('.home'), () => {

        questionStatement.text('\u00A0');
        answersDiv.empty();
        fadeIn($('.quiz'));

        questionOrder = Array.from({length: questions.length}, (_, i) => i);
        questionOrder = questionOrder.sort(() => Math.random() - 0.5);
    
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
                answerSounds[answerIndex].play();
                console.log(answerSounds[answerIndex]);
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
    answer.score.forEach(character => {
        scores[character[0]] = (scores[character[0]] || 0) + character[1];
    });
    nextQuestion();
}

function result() {
    const characterId = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    const character = characters[characterId];
    
    $('.character-greek-name').text(character?.['greek-name'] || characterId);
    $('.character-roman-name').text(character?.['roman-name'] || characterId);
    $('.character-description').text(character?.description || 'Description.');
    $('.character-image').attr('src', character?.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/681px-Placeholder_view_vector.svg.png');

    fadeOut($('.quiz'), () => {
        container.addClass('maximized');
        resultSound.play();
        $('.result').fadeIn(2000, () => {
            container.removeClass('disabled');
        });
    });
    
}

function restart() {
    fadeOut($('.result'), () => {
        container.removeClass('maximized');
        fadeIn($('.home'));
    });
}
