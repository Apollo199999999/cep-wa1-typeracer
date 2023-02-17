<script>
    //#region Imports

    //import components from Fluent Svelte
    import { Button, RadioButton, ContentDialog, TextBox } from "fluent-svelte";
    //import onMount function to execute javascript once tha page has loaded in the browser
    import { onMount } from 'svelte';
    //import library for random word generation
    import { words } from '../scripts/random-words.js';
    //import class to calculate results metrics
    import { metricsCalculatorClass } from '../scripts/metrics-calculator.js'
    //import class to load words into passage
    import { passageFunctionsClass } from '../scripts/passage-functions.js'
    //import class to highlight words in passage
    import { wordHighlightingFunctionsClass } from '../scripts/word-highlighting-functions.js'

    //#endregion

    //#region Variable declarations

    //init passageFunctions class
    let passageFunctions = new passageFunctionsClass();

    //init wordHighlightingFunctions class
    let wordHighlightingFunctions = new wordHighlightingFunctionsClass();

    //variable to store difficulty settings
    //0 represents easy difficulty, 1 represents normal difficulty, 2 represents hard difficulty
    //basically, if difficulty is easy, the passage will only contain short words (shorter than 5 characters)
    //if the difficulty is hard, the passage will only contain long words (longer than or as long as 7 characters)
    //if difficulty is normal, the passage will contain a mix of short and long words
    let gameDifficulty = 1;

    //variable to store the text in the input textbox, binded from HTML
    let inputBoxText = '';

    //variables to keep track of whether the respective dialogs are open or not
    let settingsDialogIsOpen = false, resultDialogIsOpen = false;

    //Variables relating to the passage generation
    //passageIsRandomQuote - stores passage type
    //passageWords array - to store all of the words in the passage
    //passageDiv - to store the passageDiv object, binded from HTML
    let passageIsRandomQuote = false, passageWords = [], passageDiv;

    //Word Variables
    //wordGameTime - to keep track of the amount of time per game that the user has selected (for "random words" passage type)
    //wordTimeLeft - to keep track of the amount of time left per game (for "random words" passage type)
    //wordTimerInterval - to store the setInterval object for the timer, so that we can stop the timer from anywhere (for "random words" passage type)
    let wordGameTime = 30, wordTimeLeft = wordGameTime, wordTimerInterval = null;

    //Quote variables
    //quoteTimeTaken - to keep track of time taken for the user to finish typing the quote to calculate WPM (for "random quote" passage type)
    //quoteTimeInterval - to store the setInterval object for the time taken by the user to tupe the quote
    let quoteTimeTaken = 0, quoteTimeInterval = null;
    
    //TYPING SPEED METRICS: 
    //refer to this: https://matthiaswang.notion.site/CEP-WA1-Typeracer-Game-Portfolio-ffd1182cfcd443f6a437e27761413d9d#971081aa17f4446b8c22069c4a7332dc
    let totalCharacterCount = 0, correctCharacterCount = 0, typingAccuracy = 0, wpm = 0, rawWPM = 0;

    //#endregion

    //#region Game functions

    //#region Timer functions

    //function that starts timer if not started
    function firstStartTimers() {
        //start the timer on first input, only if the user has selected "random words" as passage type 
        //if the user has selected "random quote" as passage type, there will be no timer, and the game will stop once the user has finished typing the quote. 
        //instead, for "random quote" passage type, we record the time taken
        if (wordTimerInterval == null && passageIsRandomQuote == false) {
            startWordTimer();
        }
        else if (quoteTimeInterval == null && passageIsRandomQuote == true) {
            //start measuring the time taken by the user to type the quoe
            measureQuoteTimeTaken();
        }
    }

    //function that starts the game timer
    function startWordTimer() {
        wordTimerInterval = setInterval(
            function () {
                //keep decreasing the time left while it is still not at 0s
                if (wordTimeLeft > 0) {
                    wordTimeLeft -= 1;
                }
                else {
                    //once the timer hits 0, call clear interval to stop the timer
                    clearInterval(wordTimerInterval);
                    
                    //call the gameOver function to show the game over screen
                    gameOver();
                }
            }
        , 1000);
    }

    //function to measure the time taken by the user to type the quote
    function measureQuoteTimeTaken() {
        quoteTimeInterval = setInterval(
            function() {
                //increment quotetimetaken
                quoteTimeTaken += 1;
                console.log(quoteTimeTaken);
            }
        , 1000);
    }

    function clearTimers() {
        //stop the timer for the words, if the timer exists
        if (wordTimerInterval != null) {
            clearInterval(wordTimerInterval);
            wordTimerInterval = null;
        }

        //stop measuring the time taken for the quote, if it exists
        if (quoteTimeInterval != null) {
            clearInterval(quoteTimeInterval);
            quoteTimeInterval = null;
        }
    }

    //#endregion

    //function that is called when the game ends
    function gameOver() {
        //make the input box lose focus
        var inputBox = document.getElementById("input-box");
        inputBox.blur();

        clearTimers();

        //init new metricsCalculator class
        let metricsCalculator = new metricsCalculatorClass();

        //update the wpm stats respectively for both "random word" and "random quote" passage types
        if (passageIsRandomQuote == false) {
            wpm = metricsCalculator.calculateWPM(correctCharacterCount, wordGameTime);
            rawWPM = metricsCalculator.calculateRawWPM(totalCharacterCount, wordGameTime);
        }
        else {
            wpm = metricsCalculator.calculateWPM(correctCharacterCount, quoteTimeTaken);
            rawWPM = metricsCalculator.calculateRawWPM(totalCharacterCount,quoteTimeTaken);
        }

        typingAccuracy = metricsCalculator.calculateTypingAccuracy(correctCharacterCount, totalCharacterCount)

        //show the result dialog
        resultDialogIsOpen = true;
    }

    //helper function to restore the game to its default state, where no passage is loaded
    function resetGame() {
        //make the input box lose focus
        var inputBox = document.getElementById("input-box");
        inputBox.blur();
        
        //reset wpm stats
        wpm = rawWPM = typingAccuracy = totalCharacterCount = correctCharacterCount = 0;

        //close the result dialog
        resultDialogIsOpen = false;

        clearTimers();

        //reset timetaken/timeleft variables and hide/show timer depending on passage type
        var timer = document.getElementById("timer-label");
        if (passageIsRandomQuote == false) {
            wordTimeLeft = wordGameTime;
            timer.style.visibility = "visible";
        }
        else {
            quoteTimeTaken = 0;
            timer.style.visibility = "hidden";
        }

        //clear the passagediv and scroll passageDiv to the top
        passageDiv.innerHTML = "";
        passageDiv.scrollTop = 0;

        //clear the inputbox
        inputBoxText = "";

        //clear the passagewords array
        passageWords = [];
    }

    async function startGame() {
        //reset the game
        resetGame();

        //if the passage type is random words, generate 100 random words and load it into the passage div
        if (passageIsRandomQuote == false) {
            //to generate the random words, we will use the random-words.js script, which is copied from here: https://github.com/apostrophecms/random-words/blob/main/index.js
            //the reason I do this instead of using the npm module directly, is because the functions needs to be exported in order to be used in SvelteKit
            //first generate only 100 words, and after the user finishes typing one word, another word will be procedurally generated
            
            //generate appropriate word lengths based on game difficulty
            if (gameDifficulty == 1) {
                //Normal difficulty
                passageWords = Array.from(words(100));
            }
            else if (gameDifficulty == 0) {
                //Easy difficulty
                for (let i = 0; i < 100; i++) {
                    let randomWord = words();

                    //only generate words with length less than 5
                    while (randomWord.length >= 5) {
                        randomWord = words();
                    }

                    passageWords.push(randomWord);
                }
            }
            else {
                //Hard difficulty
                for (let i = 0; i < 100; i++) {
                    let randomWord = words();

                    //only generate words with length greater or equal to 7
                    while (randomWord.length < 7) {
                        randomWord = words();
                    }

                    passageWords.push(randomWord);
                }
            }

            //load passagewords into div
            passageFunctions.loadWordsIntoDiv(passageDiv, passageWords);
            
        }
        else {
            //get random quote using quotable API
            let randomQuote = await passageFunctions.generateRandomQuote();
            
            //split random quote into words by spaces, and assign it to the passageWords array
            passageWords = Array.from(randomQuote.split(" ").filter(Boolean));

            //load passagewords into div
            passageFunctions.loadWordsIntoDiv(passageDiv, passageWords);
           
        }
    }

    //#endregion

    //#region Event Listeners

    //fires everytime the inputbox detects a new input
    function inputBoxOnTextChanged(char) {
        //increase the total character count (do not include backspace in the character count)
        if (char != null) {
            totalCharacterCount += 1;
        }

        //start necessary timers for game time/time taken
        firstStartTimers();

        //the current word is the first word in the passageWords, as everytime the user progresses, the next word is pushed to the front
        let currentWord = passageWords[0];

        //first, we check if the last characer of the text in the textbox is a space, and the text in the textbox does not only contain spaces. 
        //If so, we move on to the next word
        if (inputBoxText.endsWith(" ") && inputBoxText.trim().length >= 1) {
            //remove the first word of the passageWords, to indicate that the user has progressed
            passageWords.shift();

            //get the current span the user is typing
            var spans = document.querySelectorAll(".word-highlighted,.word-error");
            var currentSpan = spans[0];

            //highlight the current word based on if it is correctly typed or not
            correctCharacterCount += wordHighlightingFunctions.highlightCompletedWord(currentSpan, inputBoxText, currentWord);

            //clear the input textbox
            inputBoxText = "";

            //add another random word to the end of the passage div if applicable
            if (passageIsRandomQuote == false) {
                passageFunctions.generateRandomWord(passageDiv, passageWords);
            }

            //highlight the next word. if it fails, that means the user has reached the end of the quote, so show game over screen
            wordHighlightingFunctions.highlightNextWord(passageDiv, currentSpan);

            //exit the function
            return;
        }

        //check if inputBoxText is equal to the substring of the currentword up until the length of the inputBoxText
        //if they are not the same, change the highlight colour of the span to red (flag the word)
        if (inputBoxText != currentWord.substring(0, inputBoxText.length)) {
            wordHighlightingFunctions.tryFlagWord();
        }
        else {
            //unflag the word
            wordHighlightingFunctions.tryUnflagWord();
        }
    }
    //#endregion

    //onMount function: executes when page has loaded into browser. It is the entry point of this typeracer game
    onMount(() => {
        startGame();
    });

</script>

<svelte:head>
    <title>CEP Typeracer Game</title>
</svelte:head>

<body>
    <div class="container">
        <!-- Header div -->
        <div class="header">
            <div class="header-text-div">
                <h1 class="header-text">CEP Typeracer Game</h1>
            </div>
            
            <div class="settings-btn-div">
                <!-- Settings button which opens a settings dialog -->
                <Button variant="accent" on:click={() => (settingsDialogIsOpen = true)}>Settings</Button>
            </div>
        </div>
    
        <!-- Settings dialog -->
        <ContentDialog bind:open={settingsDialogIsOpen} on:close={startGame} title="Settings">
            <!-- Content for the settings dialog goes here -->
            
            <!-- Div containing options to change the passage type -->
            <div>
                <h3 class="dialog-titles">Passage type:</h3>
                <RadioButton bind:group={passageIsRandomQuote} value={false}>Random words</RadioButton>
                <br/>
                <RadioButton bind:group={passageIsRandomQuote} value={true}>Random quote</RadioButton>
            </div>
            
            <!-- Div containing difficulty options -->
            <div>
                <h3 class="dialog-titles">Game difficulty</h3>
                <RadioButton bind:group={gameDifficulty} bind:disabled={passageIsRandomQuote} value={0}>Easy</RadioButton>
                <br/>
                <RadioButton bind:group={gameDifficulty} bind:disabled={passageIsRandomQuote} value={1}>Normal</RadioButton>
                <br/>
                <RadioButton bind:group={gameDifficulty} bind:disabled={passageIsRandomQuote} value={2}>Hard</RadioButton>
            </div>

            <!-- Div containing options to change the amount of time -->
            <div>
                <h3 class="dialog-titles">Amount of time:</h3>
                <RadioButton bind:group={wordGameTime} bind:disabled={passageIsRandomQuote} value={15}>15s</RadioButton>
                <br/>
                <RadioButton bind:group={wordGameTime} bind:disabled={passageIsRandomQuote} value={30}>30s</RadioButton>
                <br/>
                <RadioButton bind:group={wordGameTime} bind:disabled={passageIsRandomQuote} value={60}>60s</RadioButton>
            </div>

            <!-- Close button -->
            <Button slot="footer" variant="accent" tabindex="-1" on:click={() => (settingsDialogIsOpen = false)}>Close</Button>
        </ContentDialog>
    
    
        <!-- Passage and input div -->
        <div class="passage-input-collection">
            <div>
                <h3 id="timer-label">Time left: {wordTimeLeft}s</h3>

                <div class="passage" bind:this={passageDiv}/>
    
                <div class="input-div">
                    <p class="input-label">Type here:</p>
                    <!-- The TextBox contains an on:input event, where it will call the inputBoxOnTextChanged function -->
                    <!-- Each character inputted into the textbox is passed in to the function as an argument -->
                    <TextBox bind:value={inputBoxText} id="input-box" autocapitalize="none" autocomplete="off" autocorrect="off" spellcheck="false" on:input={(input) => inputBoxOnTextChanged(input.data)}/>
                </div>

                <div class="links">
                    <Button
                        onclick="window.open('https://github.com/Apollo199999999/cep-wa1-typeracer', '_blank', 'noopener');"
                        variant="hyperlink">
                        GitHub repository
                    </Button>
                    <Button
                        onclick="window.open('https://matthiaswang.notion.site/CEP-WA1-Typeracer-Game-Portfolio-ffd1182cfcd443f6a437e27761413d9d', '_blank', 'noopener');"
                        variant="hyperlink">
                        Portfolio/Documentation page
                    </Button>
                    <Button
                        onclick="window.open('https://matthiaswang.notion.site/CEP-WA1-Typeracer-Game-Portfolio-ffd1182cfcd443f6a437e27761413d9d#971081aa17f4446b8c22069c4a7332dc', '_blank', 'noopener');"
                        variant="hyperlink">
                        How are my results calculated?
                    </Button>
                </div>
            </div>
        </div>
    
        <!-- ContentDialog which shows the result of the typeracer game -->
        <ContentDialog bind:open={resultDialogIsOpen} on:close={startGame} title="Results">
            <div>
                <h1>WPM: {wpm}</h1>
                <h3>Raw WPM: {rawWPM}</h3>
                <h3>Accuracy: {typingAccuracy}%</h3>
                <p>Total characters typed: {totalCharacterCount}</p>
                <p>Correct characters typed: {correctCharacterCount}</p>

                <Button
                    class="results-dialog-link"
                    onclick="window.open('https://matthiaswang.notion.site/CEP-WA1-Typeracer-Game-Portfolio-ffd1182cfcd443f6a437e27761413d9d#971081aa17f4446b8c22069c4a7332dc', '_blank', 'noopener');"
                    variant="hyperlink"
                    tabindex="-1">
                    How are my results calculated?
                </Button>
            </div>
            <!-- Close button -->
            <Button slot="footer" variant="accent" tabindex="-1" on:click={() => (resultDialogIsOpen = false)}>Close</Button>
        </ContentDialog>
    </div>
</body>



<style lang="scss">
    @use "./src/styles"; 
</style>
