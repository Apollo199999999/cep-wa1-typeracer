<script>
    //#region Imports

    //import components from Fluent Svelte
    import { Button, RadioButton, ContentDialog, TextBox } from "fluent-svelte";
    //import onMount function to execute javascript once tha page has loaded in the browser
    import { onMount } from 'svelte';
    //import library for random word generation
    import { words } from '/src/random-words.js';

    //#endregion

    //#region Variable declarations

    //variable to keep track of passage type
    let passageIsRandomQuote = false;

    //variable to keep track of whether the settings dialog is open or not
    let settingsDialogIsOpen = false;

    //variable to keep track of the amount of time per game that the user has selected (for "random words" passage type)
    let wordGameTime = 30;

    //variable to keep track of the amount of time left per game (for "random words" passage type)
    let wordTimeLeft = wordGameTime;

    //array to store all of the words in the passage
    var passageWords = [];

    //variable to store the passageDiv object, binded from HTML
    let passageDiv;

    //variable to store the text in the input textbox, binded from HTML
    let inputBoxText = '';

    //variable to store if the timer has started
    let wordTimerStarted = false;

    //variable to store the setInterval object for the timer, so that we can stop the timer from anywhere (for "random words" passage type)
    let wordTimerInterval;

    //variable to keep track of time taken for the user to finish typing the quote to calculate WPM (for "random quote" passage type)
    let quoteTimeTaken = 0;

    //variable to keep track of whether the quoteTimeTaken has started counting the time taken (to help calculate wpm)
    let quoteTimeStarted = false;

    //variable to store the setInterval object for the time taken by the user to tupe the quote
    let quoteTimeInterval;
    
    //variable to keep track of whether the result dialog (which is showed during game over), is opem
    let resultDialogIsOpen = false;

    //TYPING SPEED METRICS: 
    //refer to this: https://matthiaswang.notion.site/CEP-WA1-Typeracer-Game-Portfolio-ffd1182cfcd443f6a437e27761413d9d#971081aa17f4446b8c22069c4a7332dc
    
    //variable to keep track of the total number of characters from all of the words that the user has entered
    let totalCharacterCount = 0;

    //variable to keep track of the number characters from only the correct words that the user has typed
    let correctCharacterCount = 0;
    
    //variable to store the typing accuracy of the user
    let typingAccuracy = 0;

    //variable to store the typing speed of the user (includes only correct words), in wpm
    let wpm = 0;
    
    //variable to store the raw typing speed of the user (includes correct and wrong words) in wpm
    let rawWPM = 0;

    //#endregion

    //#region Game functions

    //helper function to determine if an element is hidden by overflow
    function isVerticallyVisible (parent, child) {
        return !(child.getBoundingClientRect().top - parent.getBoundingClientRect().top > parent.clientHeight);
    }

    //helper function to generate a random word and load it into the passage div
    function generateRandomWord() {
        //create a new span to add into the passage div, where the text content is a random word
        var randomWord = words();
        const span = document.createElement("span");
        span.textContent = randomWord + ' ';
        span.className = 'passage-word';
        //add the span to passage div, and add the random word to passage words array
        passageDiv.appendChild(span);
        passageWords.push(randomWord);

    }

    //helper function to load passagewords array into the passage div
    function loadWordsIntoDiv() {
        //load all of the words in passageWords in the passage div
        for (var i = 0; i < passageWords.length; i++) {
            const span = document.createElement("span");
            span.textContent = passageWords[i] + ' ';
            span.className = 'passage-word';
            //highlight the first word
            if (i == 0) {
                span.classList.add('word-highlighted');
            }
            passageDiv.appendChild(span);
        }
    }

    //helper function to generate quote by querying the Quotable API
    async function generateRandomQuote() {
        // Fetch a random quote from the Quotable API
        const response = await fetch("https://api.quotable.io/random?minLength=200");
        const data = await response.json();

        if (response.ok) {
            //return the quote
            return data.content;
        } 
        else {
            //show an alert
            alert("An error occured while trying to get a random quote.");
            location.reload();
            return;
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
            }
        , 1000);
    }

    //function that is called when the game ends
    function gameOver() {
        //make the input box lose focus
        var inputBox = document.getElementById("input-box");
        inputBox.blur();

        //stop the timer for the words, if the timer exists
        if (wordTimerInterval != null) {
            clearInterval(wordTimerInterval);
        }

        //stop measuring the time taken for the quote, if it exists
        if (quoteTimeInterval != null) {
            clearInterval(quoteTimeInterval);
        }

        //formatter to format percentage to 2dp
        const decimalFormatter = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,      
            maximumFractionDigits: 2,
        });

        //update the wpm stats respectively for both "random word" and "random quote" passage types
        if (passageIsRandomQuote == false) {
            wpm = (correctCharacterCount / 5) / (wordGameTime / 60);
            rawWPM = (totalCharacterCount / 5) / (wordGameTime / 60);
        }
        else {
            wpm = (correctCharacterCount / 5) / (quoteTimeTaken / 60);
            rawWPM = (totalCharacterCount / 5) / (quoteTimeTaken / 60);
        }

        wpm = decimalFormatter.format(wpm);
        rawWPM = decimalFormatter.format(rawWPM);
        typingAccuracy = (correctCharacterCount / totalCharacterCount) * 100;
        typingAccuracy = decimalFormatter.format(typingAccuracy);

        //show the result dialog
        resultDialogIsOpen = true;
    }

    //helper function to restore the game to its default state, where no passage is loaded
    function resetGame() {
        //make the input box lose focus
        var inputBox = document.getElementById("input-box");
        inputBox.blur();
        
        //reset wpm stats
        wpm = 0;
        rawWPM = 0;
        typingAccuracy = 0;
        totalCharacterCount = 0;
        correctCharacterCount = 0;

        //close the result dialog
        resultDialogIsOpen = false;

        //set wordTimerStarted to false
        wordTimerStarted = false;

        //set quotetimestarted to false
        quoteTimeStarted = false;

        //stop the timer for the words, if the timer exists
        if (wordTimerInterval != null) {
            clearInterval(wordTimerInterval);
        }

        //stop measuring the time taken for the quote, if it exists
        if (quoteTimeInterval != null) {
            clearInterval(quoteTimeInterval);
        }

        if (passageIsRandomQuote == false) {
            //Passage type is set to "random words"
            //set the timer settings
            //set the time left in the game to the time that the user has selected
            wordTimeLeft = wordGameTime;

            //show the timer element
            var timer = document.getElementById("timer-label");
            timer.style.visibility = "visible";
        }
        else {
            //Passage type is set to "random quote"
            //clear the time taken for the quote
            quoteTimeTaken = 0;

            //hide the timer
            var timer = document.getElementById("timer-label");
            timer.style.visibility = "hidden";
        }

        //clear the passagediv
        passageDiv.innerHTML = "";

        //scroll passageDiv to the top
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
            //First generate only 100 words. After the user finishes typing one word, another word will be procedually generated
            passageWords = Array.from(words(100));

            //load passagewords into div
            loadWordsIntoDiv();
            
        }
        else {
            //get random quote using quotable API
            let randomQuote = await generateRandomQuote();
            
            //split random quote into words by spaces, and assign it to the passageWords array
            passageWords = Array.from(randomQuote.split(" ").filter(Boolean));

            //load passagewords into div
            loadWordsIntoDiv();
           
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

        //start the timer on first input, only if the user has selected "random words" as passage type 
        //if the user has selected "random quote" as passage type, there will be no timer, and the game will stop once the user has finished typing the quote. 
        //instead, for "random quote" passage type, we record the time taken
        if (wordTimerStarted == false && passageIsRandomQuote == false) {
            startWordTimer();
            wordTimerStarted = true;
        }
        else if (quoteTimeStarted == false && passageIsRandomQuote == true) {
            //start measuring the time taken by the user to type the quoe
            measureQuoteTimeTaken();
            quoteTimeStarted = true;
        }

        //the current word is the first word in the passageWords, as everytime the user progresses, the next word is pushed to the front
        let currentWord = passageWords[0];

        //first, we check if the last characer of the text in the textbox is a space, and the text in the textbox does not only contain spaces. 
        //If so, we move on to the next word
        if (inputBoxText.endsWith(" ") && inputBoxText.trim().length >= 1) {
            //remove the first word of the passageWords, to indicate that the user has progressed
            passageWords.shift();

            //get all elements with either the "word-highlighted" class or the "word-error" class (which would return the current span), and remove both classes from the span
            //this removes the highlighting and error flagging from the word
            var spans = document.querySelectorAll(".word-highlighted,.word-error");
            var span = spans[0];
            span.classList.remove("word-highlighted");
            span.classList.remove("word-error");

            //next, depending on if the word the user typed is correct, make the text color of the word red or green
            let inputBoxTextWithoutSpace = inputBoxText.substring(0, inputBoxText.length - 1);

            if (inputBoxTextWithoutSpace == currentWord) {
                span.classList.add("word-correct");

                //add the number of characters in the currentWord to the correctcharactercount variable
                correctCharacterCount += inputBoxText.length;
            }
            else {
                span.classList.add("word-wrong");
            }

            //clear the input textbox
            inputBoxText = "";

            //get the next span
            var nextSpan = span.nextElementSibling;

            //if the next span is null, it means that the user has reached the end of the quote. Show game over screen
            if (nextSpan == null) {
                gameOver();
                return;
            }

            //add another random word to the end of the passage div if applicable
            if (passageIsRandomQuote == false) {
                generateRandomWord();
            }

            //highlight the next word
            nextSpan.classList.add("word-highlighted");

            //if the next word is out of view, scroll the passage div manually to bring it into view
            if (isVerticallyVisible(passageDiv, nextSpan) == false) {
                passageDiv.scrollTop += (200 - 16 - 16);
            }

            //exit the function
            return;
        }

        //check if inputBoxText is equal to the substring of the currentword up until the length of the inputBoxText
        //if they are not the same, change the highlight colour of the span to red
        if (inputBoxText != currentWord.substring(0, inputBoxText.length)) {
            //get the span which is currently highlighted
            var elements = document.getElementsByClassName("word-highlighted");
            var span = elements[0];

           if (span != null) {
                //modify the classes of the span element so that it takes on the word-error class instead, where the background is highlighted red
                span.classList.remove("word-highlighted");
                span.classList.add("word-error");
           }
        }
        else {
            //restore the grey highlighted state of the word in the passage
            //get the span which is currently flagged as an error
            var elements = document.getElementsByClassName("word-error");
            var span = elements[0];

            if (span != null) {
                //modify the classes of the span element so that it takes on the word-highlighted class instead, where the background is highlighted grey
                span.classList.remove("word-error");
                span.classList.add("word-highlighted");
            }
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
                <h3 class="dialog-titles">Passage Type:</h3>
                <RadioButton bind:group={passageIsRandomQuote} value={false}>Random words</RadioButton>
                <br/>
                <RadioButton bind:group={passageIsRandomQuote} value={true}>Random quote</RadioButton>
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
