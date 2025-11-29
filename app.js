// 1. Define all correct codes for each challenge
const codes = [
	"BEGIN", // Challenge 0 / starting code
	"LOOK", // Challenge 1
	"ICE", // Challenge 2
	"OMEN", // Challenge 3
	"SHIVER", // Challenge 4
	"NIKE", // Challenge 5
	"SNOW", // Challenge 6
	"GOLDEN", // Challenge 7
	"DISCOVERY", // Challenge 8
	"CELESTIAL", // Challenge 9 (finale)
];

// 2. Grab DOM elements
const codeInput = document.getElementById("codeInput");
const submitButton = document.getElementById("submitCode");
const progressValue = document.getElementById("progressValue");
const hints = document.querySelectorAll("#hints p");
const message = document.getElementById("message");
const guessesValue = document.getElementById("guessesValue");

// 3. Load saved progress
let progress = parseInt(localStorage.getItem("progress") || "0");

// 4. Daily guesses system with lock
let guesses = parseInt(localStorage.getItem("guesses") || "3");
let lastDate = localStorage.getItem("lastDate") || "";
const today = new Date().toISOString().split("T")[0];

if (today !== lastDate) {
	guesses = 3;
	lastDate = today;
	localStorage.setItem("guesses", guesses);
	localStorage.setItem("lastDate", lastDate);
}

// update guesses UI
guessesValue.textContent = guesses;

// Apply lock if no guesses left
if (guesses <= 0) {
	codeInput.disabled = true;
	submitButton.disabled = true;
	lockIcon.style.display = "inline";
} else {
	codeInput.disabled = false;
	submitButton.disabled = false;
	lockIcon.style.display = "none";
}

// 5. Update hint param / URL (existing logic)
function updateHintParam(progress) {
	const url = new URL(window.location);
	if (progress === 2) {
		url.searchParams.set("shh", "ice");
		url.searchParams.delete("code");
	} else if (progress === 6) {
		url.searchParams.set("shh", "moonlight");
		url.searchParams.delete("code");
	} else if (progress === 9) {
		url.searchParams.delete("shh");
		if (url.searchParams.get("code") === "8.5") {
			progressValue.textContent = "43 45 4C 45 53 54 49 41 4C";
		} else {
			url.searchParams.set("code", "0");
		}
	} else {
		url.searchParams.delete("shh");
		url.searchParams.delete("code");
	}
	history.replaceState(null, "", url);
}

// 6. Update message display
function showMessage(text, type = "normal") {
	message.textContent = text;

	switch (type) {
		case "error":
			message.style.color = "red";
			break;
		case "success":
			message.style.color = "green";
			break;
		case "complete":
			message.style.color = "gold";
			break;
		default:
			message.style.color = "black";
	}
}

// 7. Reveal already solved hints if returning
for (let i = 0; i < progress; i++) {
	if (hints[i]) hints[i].style.display = "block";
}

progressValue.textContent = progress;
updateHintParam(progress);

console.log("Hello there! What are you doing in here?");
console.log("Even if there is something in here, why would anybody look?");
console.log("But maybe your just that type of person.");

if (progress === 8) {
	console.log("Looks like for this one it paid off.");
	console.log("I wouldn't check back here again though.");
	console.log("Here is what you are looking for: UZJTFMVIP");
	console.log("This code is encoded. See if you can figure it out!");
	console.log("Hint: I'm pretty sure you have learnt this at some point.");
	console.log("Goodbye :)");
}

if (progress === codes.length) {
	showMessage("🎉 Congratulations! You completed the Grand Puzzle Challenge! The challenge shall return another time...", "complete");
	codeInput.disabled = true;
	submitButton.disabled = true;
}

// 8. Handle code submission with 3 guesses/day
submitButton.addEventListener("click", () => {
	const entered = codeInput.value.trim().toUpperCase();

	if (guesses <= 0) {
		showMessage("You have used all your attempts for today. Return tomorrow to try again.", "error");
		return;
	}

	if (entered === codes[progress]) {
		// correct
		if (hints[progress]) hints[progress].style.display = "block";
		progress++;
		localStorage.setItem("progress", progress);
		progressValue.textContent = progress;
		updateHintParam(progress);

		codeInput.value = "";

		// reset guesses if correct
		guesses = 3;
		localStorage.setItem("guesses", guesses);
		guessesValue.textContent = guesses;

		// unlock input
		codeInput.disabled = false;
		submitButton.disabled = false;
		lockIcon.style.display = "none";

		if (progress === codes.length) {
			showMessage("🎉 Congratulations! You completed the Grand Puzzle Challenge! The challenge shall return another time...", "complete");
			codeInput.disabled = true;
			submitButton.disabled = true;
		} else {
			showMessage("Correct! Next hint unlocked.", "success");
			if (progress === 8) {
				console.log("Looks like for this one it paid off.");
				console.log("I wouldn't check back here again though.");
				console.log("Here is what you are looking for: UZJTFMVIP");
				console.log("This code is encoded. See if you can figure it out!");
				console.log("Hint: I'm pretty sure you have learnt this at some point.");
				console.log("Goodbye :)");
			}
		}
	} else {
		// wrong
		guesses--;
		localStorage.setItem("guesses", guesses);
		guessesValue.textContent = guesses;

		if (guesses <= 0) {
			codeInput.disabled = true;
			submitButton.disabled = true;
			lockIcon.style.display = "inline";
			showMessage("Incorrect. You have no remaining attempts today. Return tomorrow.", "error");
		} else {
			showMessage(`Incorrect. You have ${guesses} attempts remaining today.`, "error");
		}
	}
});

codeInput.addEventListener("keyup", (e) => {
	if (e.key === "Enter") submitButton.click();
});

document.querySelectorAll(".star").forEach((star) => {
	// random start percentage of the animation
	const randomPercent = Math.random(); // 0–1
	star.style.animationDelay = `-${(randomPercent * 5).toFixed(2)}s`;
});

const floaters = document.querySelectorAll(".floater");
floaters.forEach((floater) => {
	const duration = 10; // match the animation-duration of your floaters
	const randomPercent = Math.random(); // 0–1
	floater.style.animationDelay = `-${(randomPercent * 40).toFixed(2)}s`;
});
