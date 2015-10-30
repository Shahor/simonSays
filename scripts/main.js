var Simon = (function () {
	'use strict';

	var picked = [];
	var playerPicks = [];
	var Colors = ['yellow', 'green', 'red', 'blue'];
	var Controls = document.querySelector('#controls');
	var Simon = document.querySelector('#simon');

	/**
	 * Simple utility, generates a random number
	 * between min and max (included)
	 * @param  {Number} min
	 * @param  {Number} max
	 * @return {Number}
	 */
	function getRandom(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	/**
	 * Resets game to its original state, ready to be played
	 * again if needed be
	 */
	function resetGame() {
		picked = [];
		playerPicks = [];
		setPlayerTurn(false);
	}

	/**
	 * Highlight the given element and call a callback when the
	 * highlighting is done
	 * @param  {String}   color    The color to highlight
	 * @param  {Function} callback The callback to call once the highlighting
	 *                             is finished
	 */
	function highlight(color, callback) {
		var element = document.querySelector('#' + color),
			highlightDuration = 500;

		element.classList.add('pad__selected');

		var event = new CustomEvent('highlighted', {
			detail : {
				color : color
			},
			bubbles : true
		});
		element.dispatchEvent(event);

		// Make it be highlighted for 500ms
		setTimeout(function () {
			element.classList.remove('pad__selected');
			// Wait highlightDuration of non-highlight before
			// going to the next step so we can actually see
			// something happening when there's twice the same
			// color in a row
			setTimeout(callback, highlightDuration);
		}, highlightDuration);
	}

	/**
	 * Allows/Forbids the player to click on the colors
	 */
	function setPlayerTurn(hisTurn) {
		hisTurn = hisTurn || false;

		if (hisTurn) {
			Simon.addEventListener('click', handlePlayerInput);
			Simon.classList.add('clickable');
		} else {
			Simon.removeEventListener('click', handlePlayerInput);
			Simon.classList.remove('clickable');
		}
	}

	function animateSimon(steps) {
		// Finished animating the whole thing
		if (!steps.length) {
			// waitForUser
			setPlayerTurn(true);
			return;
		}

		highlight(steps[0], function () {
			animateSimon(steps.slice(1));
		});
	}

	/**
	 * Make the computer play its part!
	 */
	function play() {
		dispatchScore();
		picked.push(Colors[getRandom(0, Colors.length - 1)]);
		animateSimon(picked);
	}

	/**
	 * Tells the player he has just lost!
	 * Flashes the screen and resets the game for a new one.
	 */
	function youLose() {
		Simon.dispatchEvent(new Event('lost'));
		resetGame();
	}

	function dispatchScore() {
		Simon.dispatchEvent(new CustomEvent('score', {
			detail : {
				score : picked.length
			}
		}));
	}

	/**
	 * Handle the player's input
	 * This is where the main logic is done
	 * @param  {Event} e
	 */
	function handlePlayerInput(e) {
		var color = e.target.id;
		setPlayerTurn(false);
		highlight(color, function () {
			playerPicks.push(color);

			for (var i = 0; i < playerPicks.length; i++) {
				if (playerPicks[i] !== picked[i]) {
					youLose();
					return;
				}
			}

			// The player just finished the sequence.
			// Passing to the computer to add one more
			if (picked.length === playerPicks.length) {
				playerPicks = [];
				// Just wait a little before letting the computer play
				// in order to be able to see all that's happening
				setTimeout(play, 300);
			} else {
				// Still player's turn
				setPlayerTurn(true);
			}
		});
	}

	// Your code here

	// Handle the click on the play button
	Controls.addEventListener('click', function (e) {
		if (e.target.id === 'play') {
			resetGame();
			play();
		}
	});

	Simon.addEventListener('highlighted', function (e) {
		var color = e.detail.color;
		var audio = document.querySelector('audio#' + color);

		if (audio) audio.play();
	});

	Simon.addEventListener('lost', function () {
		var currentColor = document.body.style.backgroundColor;
		document.body.style.backgroundColor = 'red';

		setTimeout(function () {
			document.body.style.backgroundColor = currentColor;
		}, 1000);
	});

	Simon.addEventListener('score', function (e) {
		document.querySelector('#score span').textContent = e.detail.score;
	});
}());