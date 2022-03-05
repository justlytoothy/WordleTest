document.addEventListener("DOMContentLoaded", () => {

    let guessedWords = [[]];
    let availableSpace = 1;
    let word;
    let guessedWordCount = 0; 


    createSquares();
    getNewWord();

    const keys = document.querySelectorAll('.keyboard-row button');

    /**
     * Fetches a new word for the game to use from the API
     */
    function getNewWord() {
        fetch (
            `https://wordsapiv1.p.rapidapi.com/words/?random=true&lettersMin=5&lettersMax=5`,
            {
                method: "GET",
                headers: {
                    "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
                    "x-rapidapi-key": "1a410c5f06mshecb4f2eb0036e5ap127f19jsnb1afd2bbe4f8",
                },
            }
        )
        .then ((response) => {
            return response.json();
        })
        .then ((res) => {
            word = res.word;
            console.log(word);
        })
        .catch((err) => {
            console.error(err);
        });
    }
    /**
     * Returns the current array of guessed words
     * @returns the current array of guessed words
     */
    function getCurrentWordArr() {
        const numGuessedWords = guessedWords.length;
        return guessedWords[numGuessedWords - 1];
    }
    /**
     * updates the current guessed words and puts letters in gameboard
     * @param {*} letter the letters being inputed
     */
    function updateGuessedWords(letter) {
        const currWordArr = getCurrentWordArr();
        if (currWordArr && currWordArr.length < 5) {
            currWordArr.push(letter);

            const availableSpaceEl = document.getElementById(String(availableSpace));
            availableSpace+=1;
            availableSpaceEl.textContent = letter;
        }
    }
    /**
     * checks correctness of letter and returns color based on that
     * @param {*} letter the letter guessed
     * @param {*} index the position of the letter within letter array
     * @returns the color value of the tile based on correctness and position
     */
    function getTileColor(letter, index) {
        const isCorrectLetter = word.includes(letter);
        if (!isCorrectLetter) {
            return "rgb(58, 58, 60)";
        }

        const letterInPos = word.charAt(index);
        const isCorrectPosition = letter === letterInPos;

        if (isCorrectPosition) {
            return "rgb(83, 141, 78)";
        }

        return "rgb(181, 159, 59)";
    }
    /**
     * Function to be called every time enter is selected
     * First part checks to see if this is a real word with fetch, then changes color of letters based in correctness
     * Then finally checks to see if word is correct
     */
    function handleSubmitWord() {
        const currWordArr = getCurrentWordArr();
        let correct = false;
        

        if (currWordArr.length !== 5) {
            window.alert("Word must be 5 letters!");
        }
        const currentWord = currWordArr.join("");

        fetch(`https://wordsapiv1.p.rapidapi.com/words/${currentWord}`, {
            method: "GET",
            headers: {
                "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
                "x-rapidapi-key": "1a410c5f06mshecb4f2eb0036e5ap127f19jsnb1afd2bbe4f8",
            },
        })
            .then((res) => {
                if (!res.ok) {
                    throw Error();
                }

                const firstLetterId = guessedWordCount * 5 + 1;

                const interval = 200;
                currWordArr.forEach((letter,index) => {
                    
                    setTimeout(()=> {
                        const tileColor = getTileColor(letter, index);

                        const letterId = firstLetterId + index;
                        const letterEl = document.getElementById(letterId);
                        const currLetterKey = document.getElementById(letter);
                        letterEl.classList.add("animate__flipInX");
                        letterEl.style = `background-color:${tileColor};border-color:${tileColor};`;
                        currLetterKey.style = `background-color:${tileColor};`;
                    }, interval * index);
                });

                guessedWordCount += 1;

        if (currentWord === word) {
            correct = true;
            window.alert("Correct");
        }

        if (guessedWords.length === 6 && !correct) {
            window.alert(`You have run out of guesses! The word was actually ${word}`);
        }
        
        guessedWords.push([]);
        })
        .catch(() => {
            window.alert("Word is not recognized");
        });
    }

    /**
     * Called at beginning, generates all squares on board and applies animations
     */
    function createSquares() {
        const gameBoard = document.getElementById("board");
        for (let index = 0; index < 30; index++) {
            let square = document.createElement("div");
            square.classList.add("square");
            square.classList.add("animate__animated");
            square.setAttribute("id",index + 1);
            gameBoard.appendChild(square);
            
        }
    }

    function handleDelete() {
        const currWordArr = getCurrentWordArr();
        const removedLetter = currWordArr.pop();

        guessedWords[guessedWords.length - 1] = currWordArr;

        const lastLetterEl = document.getElementById(String(availableSpace - 1));

        lastLetterEl.textContent = "";
        availableSpace -= 1;
    }
    /**
     * Handles keyboard input
     */
    for (let i = 0; i < keys.length; i++) {
        keys[i].onclick = ({ target }) => {
            const letter = target.getAttribute("data-key");

            if (letter === "enter") {
                handleSubmitWord();
                return;
            }

            if (letter === "del") {
                handleDelete();
                return;
            }

            updateGuessedWords(letter);
        };
    }
});