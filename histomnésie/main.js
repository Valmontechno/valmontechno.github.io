function EventForm() {
	this.form = document.getElementsByClassName('event-form')[0];
	this.title = document.getElementsByClassName('event-title-form')[0];
	this.info = document.getElementsByClassName('event-info-form')[0];
	this.inputContainer = document.getElementsByClassName('input-container-form')[0];
	this.inputDay = document.getElementsByClassName('input-day')[0];
	this.inputDay2 = document.getElementsByClassName('input-day-2')[0];
	this.inputMonth = document.getElementsByClassName('input-month')[0];
	this.inputMonth2 = document.getElementsByClassName('input-month-2')[0];
	this.inputYear = document.getElementsByClassName('input-year')[0];
	this.inputYear2 = document.getElementsByClassName('input-year-2')[0];
	this.daySeparator = document.getElementsByClassName('day-separator-form')[0];
	this.monthSeparator = document.getElementsByClassName('month-separator-form')[0];
	this.yearSeparator = document.getElementsByClassName('year-separator-form')[0];
	this.passButton = document.getElementsByClassName('pass-button-form')[0]
	this.answerContainer = document.getElementsByClassName('answer-container-form')[0];
	this.answer = document.getElementsByClassName('answer-form')[0];
	this.answer.wrong = this.answer.getElementsByClassName('wrong')[0]
	this.answer.correct = this.answerContainer.getElementsByClassName('correct')[0]
	this.nextButton = document.getElementsByClassName('next-button-form')[0];
	this.resultForm = document.getElementsByClassName('result-form')[0];
	this.resultCircle = document.querySelector('.circle-container svg circle:nth-child(2)');
	this.resultSpan = this.resultForm.getElementsByTagName('span')[0];
	this.questionNumber = document.getElementsByClassName('question-number')[0];
	this.wrongAnswersForm = document.getElementsByClassName('wrong-answers-form')[0];
}
const form = new EventForm();

/* function searchEvents(searchTerm, events) {
	const regex = new RegExp(searchTerm, 'i');
	const matchingEvents = events.filter(event => regex.test(event.name));
	return matchingEvents;
}

searchInput.addEventListener('keyup', function() {
	fetch('events.json')
		.then(response => response.json())
		.then(events => {
			while (suggestionUl.firstChild)
				suggestionUl.removeChild(suggestionUl.firstChild);
			if (!/^\s*$/g.test(searchInput.value)) {
				searchEvents(searchInput.value, events).forEach(suggestion => {
					const li = document.createElement('li');
					li.textContent = suggestion.name;
					suggestionUl.appendChild(li);
				});
			}
		})
		.catch(error => console.error(error));
}); */

let events;
let questions;
let goodAnswers = 0;
let wrongAnswers;
let showWrongAnswer;

main();
async function main() {

	events = await (await fetch('events.json')).json();
	questions = [];
	for (let i = 0; i < events.length; i++)
		questions.push(i);
	let q;
	wrongAnswers = [];
	showWrongAnswer = true;

	askQuestion();
	async function askQuestion() {
		if (!questions.length) {
			form.form.style.display = 'none';
			form.resultSpan.textContent = Math.floor(goodAnswers / events.length * 100) + '%';
			form.resultCircle.style.setProperty('--to-stroke-dashoffset', 440 - goodAnswers / events.length * 440);
			form.resultCircle.style.animationPlayState = 'running';
			form.resultForm.style.display = 'block';
			form.questionNumber.textContent = '';
			if (wrongAnswers.length) {
				wrongAnswers.forEach(event => {
					
				});
				// form.wrongAnswersForm.style.display = 'block';
			}

		} else {
			form.form.classList.add('exit-form');
			await new Promise(resolve => setTimeout(resolve, 250));
			q = questions[Math.floor(Math.random() * questions.length)];
			questions.splice(questions.indexOf(q), 1);
			form.title.textContent = events[q].name;
			form.info.textContent = events[q].info ? events[q].info : '';
			form.form.reset();
			form.inputDay.toggleAttribute('disabled', !['date', 'two-days'].includes(events[q].type));
			form.inputDay2.toggleAttribute('disabled', events[q].type != 'two-days');
			form.inputMonth.toggleAttribute('disabled', !['date', 'month', 'two-months', 'two-days'].includes(events[q].type));
			form.inputMonth.parentNode.toggleAttribute('disabled', form.inputMonth.disabled);
			form.inputMonth2.toggleAttribute('disabled', events[q].type != 'two-months');
			form.inputMonth2.parentNode.toggleAttribute('disabled', form.inputMonth2.disabled);
			form.inputYear2.toggleAttribute('disabled', events[q].type != 'two-years');
			form.daySeparator.toggleAttribute('disabled', form.inputDay2.disabled);
			form.monthSeparator.toggleAttribute('disabled', form.inputMonth2.disabled);
			form.yearSeparator.toggleAttribute('disabled', form.inputYear2.disabled);
			form.form.style.visibility = 'visible';
			form.form.classList.remove('exit-form');
			form.form.classList.add('entrance-form');
			await new Promise(resolve => setTimeout(resolve, 250));
			form.form.classList.remove('entrance-form');
			form.form.querySelector('input:not([disabled]), select:not([disabled])').focus();
			form.questionNumber.textContent = `${events.length - questions.length}/${events.length}`;
		}
	}

	function getAnswer() {
		return [
			form.inputDay.value.padStart(2,0),
			form.inputDay2.value.padStart(2,0),
			form.inputMonth.value.padStart(2,0),
			form.inputMonth2.value.padStart(2,0),
			(form.inputYear.value.includes('-')?'-':'')+form.inputYear.value.replace('-', '').padStart(4,0),
			(form.inputYear2.value.includes('-')?'-':'')+form.inputYear2.value.replace('-', '').padStart(4,0)
		]
	}

	form.form.addEventListener('submit', function(e) {
		e.preventDefault();
		let answer = '';
		[day, day2, month, month2, year, year2] = getAnswer();
		if (events[q].type == 'date')
			answer = `${day}_${month}_${year}`;
		else if (events[q].type == 'two-days')
			answer = `${day}/${day2}_${month}_${year}`;
		else if (events[q].type == 'month')
			answer = `${month}_${year}`;
		else if (events[q].type == 'two-months')
			answer = `${month}/${month2}_${year}`;
		else if (events[q].type == 'year')
			answer = `${year}`;
		else if (events[q].type == 'two-years')
			answer = `${year}/${year2}`;
		showWrongAnswer = true;
		if (answer == events[q].date) {
			goodAnswers++;
			askQuestion();
		} else {
			showAnswer();
		}
	});
	function showAnswer() {
		function monthToChain(x) {
			return ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][Number(x)-1];
		}
		let date;

		if (showWrongAnswer) {
			[day, day2, month, month2, year, year2] = getAnswer();
			if (events[q].type == 'date')
				date = `${Number(day)} ${monthToChain(month)} ${Number(year)}`;
			else if (events[q].type == 'two-days')
				date = `${Number(day)} et ${Number(day2)} ${monthToChain(month)} ${Number(year)}`;
			else if (events[q].type == 'month')
				date = `${monthToChain(month)} ${Number(year)}`;
			else if (events[q].type == 'two-months')
				date = `${monthToChain(month)} à ${monthToChain(month2)} ${Number(year)}`;
			else if (events[q].type == 'year')
				date = `${Number(year)}`;
			else if (events[q].type == 'two-years')
				date = `${Number(year)} à ${Number(year2)}`;
			form.answer.wrong.textContent = date;
			wrongAnswers.push([q, date]);
		} else
			form.answer.wrong.textContent = '';

		answer = events[q].date.split(/_|\//);
		if (events[q].type == 'date')
			date = `${Number(answer[0])} ${monthToChain(answer[1])} ${Number(answer[2])}`;
		else if (events[q].type == 'two-days')
			date = `${Number(answer[0])} et ${Number(answer[1])} ${monthToChain(answer[2])} ${Number(answer[3])}`;
		else if (events[q].type == 'month')
			date = `${monthToChain(answer[0])} ${Number(answer[1])}`;
		else if (events[q].type == 'two-months')
			date = `${monthToChain(answer[0])} à ${monthToChain(answer[1])} ${Number(answer[2])}`;
		else if (events[q].type == 'year')
			date = `${Number(answer[0])}`;
		else if (events[q].type == 'two-years')
			date = `${Number(answer[0])} à ${Number(answer[1])}`;
		form.answer.correct.textContent = date;
		form.form.classList.add('answer');
		form.nextButton.focus();
	}
	form.passButton.addEventListener('click', function(e) {
		e.preventDefault();
		showWrongAnswer = false;
		showAnswer();
	});
	form.nextButton.addEventListener('click', function(e) {
		e.preventDefault();
		form.form.classList.remove('answer');
		askQuestion();
	});

}

// Oel ngati kameie