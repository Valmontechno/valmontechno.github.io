/* Welcome to the main.js file. If I politely greet the code, it has a better chance of working. */

const allQuests = JSON.parse(document.getElementById('quests').textContent)
const random = new Rng();

const version = '1.0';
const bingoGrid = getElem('bingo');
const modalPortal = getElem('modal-portal');
const modalComplete = getElem('modal-complete');
const modalSettings = getElem('modal-settings');
const modalRules = getElem('modal-rules');
const modalAbout = getElem('modal-about');
const modalEnd = getElem('modal-end');
const modalAlert = getElem('modal-alert');
const contextmenu = getElem('contextmenu');

let selectedQuest = 0;
let modalHistory = [];
let quests = [];
let remainingQuests = {};
let player1Quests = new Set();
let player2Quests = new Set();
let closingWarning = false;
let gameFinished = false;

getElem('page').classList.add('shown');
getElem('version-modal-about').textContent = 'Version  ' + version;

function getElem(a) {
	return document.getElementsByClassName(a)[0]
}

window.addEventListener('beforeunload', function(){
	if (closingWarning)
		event.returnValue =  true;
});

/* game */

generateQuests();

function generateQuests() {
	remainingQuests = JSON.parse(JSON.stringify(allQuests));
	quests = [];
	console.log(random.seed);
	remainingQuests.distribution.forEach(function(q) {
		for (i=0; i<q[1]; i++) {
			let n = random.numberBetween(0, remainingQuests[q[0]].length);
			quests.splice(random.numberBetween(0, quests.length), 0, replaceValuesRandomly(remainingQuests[q[0]][n]));
			remainingQuests[q[0]].splice(n, 1);
		}
	});
	for (i = 0; i < quests.length; i++) {
		let cell = bingoGrid.children[i].getElementsByClassName('button-content')[0];
		cell.textContent = quests[i];
		cell.quest = i;
		let button = cell.parentNode;
		button.classList.remove('p1');
		button.classList.remove('p2');
		if (player1Quests.has(i))
			button.classList.add('p1');
		else if (player2Quests.has(i))
			button.classList.add('p2');
		cell.parentNode.addEventListener('click', askValidateQuest);
	}
	gameFinished = false;
	bingoGrid.classList.remove('finished');
}

function replaceValuesRandomly(input) {
	let output = '';
	let replace = 0;
	let min = '';
	let max = '';
	for (let i=0; i<input.length; i++) {
		if (input[i] == '{') {
			replace = 1;
			min = '';
		} else if (input[i] == ':') {
			replace = 2;
			max = '';
		} else if (input[i] == '}') {
			replace = 0;
			output += random.numberBetween(Number(min), Number(max)+1);
		} else if (replace == 0)
			output += input[i];
		else if (replace == 1)
			min += input[i];
		else
			max += input[i];
	}
	return output;
}

function askValidateQuest() {
	if (!gameFinished) {
		openModal(modalComplete);
		selectedQuest = [...this.parentNode.children].indexOf(this);
		getElem('title-modal-complete').textContent = `Qui a validé la quête "${quests[selectedQuest]}" ?`;
	}
}

/* modal */

function openModal(modal) {
	document.body.classList.add('no-scroll');
	modalPortal.classList.add('shown');
	if (modalHistory[modalHistory.length-1])
		modalHistory[modalHistory.length-1].classList.remove('shown');
	modal.classList.add('shown');
	modalHistory.push(modal);
}

function closeModal() {
	if (modalHistory.length) {
		modalHistory.pop().classList.remove('shown');
		if (modalHistory.length)
			modalHistory[modalHistory.length-1].classList.add('shown');
		else {
			document.body.classList.remove('no-scroll');
			modalPortal.classList.remove('shown');
		}
	}
}

function displayAlert(a) {
	modalAlert.getElementsByTagName('h1')[0].innerHTML = a.replaceAll('\n', '<br>');
	openModal(modalAlert);
}

modalPortal.addEventListener('click', function(e) {
	if (e.target == this)
		closeModal();
});
getElem('ok-button-modal-alert').addEventListener('click', closeModal);

/* modal complete */

document.getElementsByClassName('button-modal-complete')[0].addEventListener('click', function() {
	validateQuest(selectedQuest, 1);
});
document.getElementsByClassName('button-modal-complete')[1].addEventListener('click', function() {
	validateQuest(selectedQuest, 2);
});
document.getElementsByClassName('button-modal-complete')[2].addEventListener('click', function() {
	validateQuest(selectedQuest, 0);
});

function validateQuest(quest, player) {
	const button = bingoGrid.getElementsByClassName('quest')[quest];
	button.classList.remove('p1');
	button.classList.remove('p2');
	player1Quests.delete(quest);
	player2Quests.delete(quest);
	if (player == 1){
		button.classList.add('p1');
		player1Quests.add(quest);
	} else if (player == 2){
		button.classList.add('p2');
		player2Quests.add(quest);
	}
	closeModal();
	closingWarning = true;
	if (player1Quests.size >= 13 || player2Quests.size >= 13)
		win(player);
}

/* modal settings */

getElem('button-settings').addEventListener('click', function() {
	getElem('seed-input-modal-settings').value = random.seed;
	getElem('undo-button-modal-settings').classList.remove('shown');
	openModal(modalSettings);
});
getElem('seed-input-modal-settings').addEventListener('keyup', function() {
	if (getElem('seed-input-modal-settings').value == random.seed)
		getElem('undo-button-modal-settings').classList.remove('shown');
	else
		getElem('undo-button-modal-settings').classList.add('shown');
});
getElem('undo-button-modal-settings').addEventListener('click', function() {
	getElem('seed-input-modal-settings').value = random.seed;
	this.classList.remove('shown');
});
getElem('generate-button-modal-settings').addEventListener('click', function() {
	if (closingWarning && ! confirm('Générer une nouvelle partie ?\nLes modifications que vous avez apportées ne seront peut-être pas enregistrées.'))
		return;
	closingWarning = false;
	getElem('undo-button-modal-settings').classList.remove('shown');
	random.setSeed(getElem('seed-input-modal-settings').value);
	player1Quests = new Set();
	player2Quests = new Set();
	generateQuests();
	closeModal();
});
getElem('random-button-modal-settings').addEventListener('click', function() {
	if (closingWarning && ! confirm('Générer une nouvelle partie ?\nLes modifications que vous avez apportées ne seront peut-être pas enregistrées.'))
		return;
	closingWarning = false;
	getElem('undo-button-modal-settings').classList.remove('shown');
	random.generateSeed();
	player1Quests = new Set();
	player2Quests = new Set();
	generateQuests();
	closeModal();
});
getElem('save-button-modal-settings').addEventListener('click', saveGame);
getElem('import-button-modal-settings').addEventListener('click', function() {
	getElem('import-input-modal-settings').click();
});
getElem('import-input-modal-settings').addEventListener('change', importGame);
getElem('rules-button-modal-settings').addEventListener('click', function() {
	openModal(modalRules);
});
getElem('back-button-modal-settings').addEventListener('click', closeModal);

function saveGame() {
	let a = document.createElement('a');
	a.setAttribute('href','data:application/json;charset=utf-8, ' + encodeURIComponent(JSON.stringify({
		bingo: {
			version: version,
			seed: random.seed,
			p1: [...player1Quests],
			p2: [...player2Quests]
		}
	})));
	a.setAttribute('download', 'Zelda Botw Bingo Save.json');
	a.click();
	closingWarning = false;
}

function importGame() {
	let fileReader = new FileReader();
	fileReader.readAsText(this.files[0]);
	if (this.files[0].type == 'application/json') {
		fileReader.onload = function() {
			try {
				let save = JSON.parse(fileReader.result).bingo;
				if (save.version == version) {
					random.setSeed(save.seed);
					player1Quests = new Set(save.p1);
					player2Quests = new Set(save.p2);
					generateQuests();
					closeModal();
				} else
					displayAlert(`Impossible de lire le fichier de sauvegarde car il se trouve à la version ${save.version} alors que la version actuelle est ${version}.`);
			} catch {
				displayAlert('Le fichier de sauvegarde est corrompu.');
			}
		};
	} else {
		displayAlert('Le fichier doit être au format json.')
	}
	fileReader.onerror = function() {
		displayAlert('Une erreur est survenue.')
	};
	this.type = '';
	this.type = 'file';
}

/* modal rules */

getElem('about-button-modal-rules').addEventListener('click', function() {
	openModal(modalAbout);
});
getElem('back-button-modal-rules').addEventListener('click', closeModal);

/* modal about */

getElem('back-button-about-rules').addEventListener('click', closeModal);

/* modal end */

getElem('validate-button-modal-end').addEventListener('click', closeModal);

function win(winner) {
		openModal(modalEnd);
		let video = getElem('video-modal-end');
		if (winner == 1)
			video.src = 'assets/day.mp4';
		else
			video.src = 'assets/night.mp4';
		video.play();
		getElem('title-modal-end').innerHTML = `Bravo Link, tu es le héros ${random.seed.toLowerCase().includes('oel ngati kameie')?"de Pandora":"d'Hyrule"} !<br>Le Joueur ${winner} à gagné !`;
		closingWarning = false;
		gameFinished = true;
		bingoGrid.classList.add('finished');
}