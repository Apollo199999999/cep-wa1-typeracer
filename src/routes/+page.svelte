<script>
    //import components from Fluent Svelte
    import { Button, RadioButton, ContentDialog, TextBox } from "fluent-svelte";
    //import onMount function to execute javascript once tha page has loaded in the browser
    import { onMount } from 'svelte';
    import { words } from '/src/random-words.js';

    //#region Variable declarations

    //variable to keep track of passage type
    let passageIsRandomWords = true;

    //variable to keep track of whether the settings dialog is open or not
    let settingsDialogIsOpen = false;

    //variable to keep track of the amount of time per game that the user has selected
    let gameTime = 30;

    //array to store all of the words in the passage
    var passageWords = [];

    //variable to store the passageDiv object, binded from HTML
    let passageDiv;

    //variable to store the textbox object, which is where the user will type the word, binded from HTML
    let inputBox;

    //variable to store if the timer has started
    let timerStarted = false;

    //#endregion

    function startGame() {
        //set timerStarted to false
        timerStarted = false;

        //if the passage type is random words, generate 100 random words and load it into the passage div
        if (passageIsRandomWords == true) {
            //to generate the random words, we will use the random-words.js script, which is copied from here: https://github.com/apostrophecms/random-words/blob/main/index.js
            //the reason I do this instead of using the npm module directly, is because the functions needs to be exported in order to be used in SvelteKit
            passageWords = Array.from(words(100));

            //load all of the words in passageWords in the passage div
            for (var i = 0; i < passageWords.length; i++) {
                const span = document.createElement("span");
                span.textContent = passageWords[i] + ' ';
                span.className = 'passage-word';
                //highlight the first word
                if (i == 0) {
                    span.classList.add('highlighted');
                }
                passageDiv.appendChild(span);
            }
        }
        else {
            //TODO: RANDOM QUOTE GENERATOR
        }
    }

    onMount(() => {
        startGame();

        //attach an event listener to the textbox
        
    });

</script>

<svelte:head>
    <title>CEP Typeracer Game</title>
</svelte:head>

<body>
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
    <ContentDialog bind:open={settingsDialogIsOpen} title="Settings">
        <!-- Content for the settings dialog goes here -->
        
        <!-- Div containing options to change the passage type -->
        <div>
            <h3 class="dialog-titles">Passage Type:</h3>
            <RadioButton bind:group={passageIsRandomWords} value={true}>Random words</RadioButton>
            <br/>
            <RadioButton bind:group={passageIsRandomWords} value={false}>Random quote/punctuation</RadioButton>
        </div>

        <!-- Div containing options to change the amount of time -->
        <div>
            <h3 class="dialog-titles">Amount of time:</h3>
            <RadioButton bind:group={gameTime} value={15}>15s</RadioButton>
            <br/>
            <RadioButton bind:group={gameTime} value={30}>30s</RadioButton>
            <br/>
            <RadioButton bind:group={gameTime} value={60}>60s</RadioButton>
        </div>

        <!-- Close button -->
        <Button slot="footer" variant="accent" on:click={() => (settingsDialogIsOpen = false)}>Close</Button>
    </ContentDialog>


    <!-- Passage and input div -->
    <div class="passage-input-collection">
        <div class="passage" bind:this={passageDiv}/>

        <div class="input-div">
            <p class="input-label">Type here:</p>
            <TextBox bind:this={inputBox}/>
        </div>
    </div>

    <!-- Div which contains quick links at the bottom of the page -->
    <div class="footer">
        <Button
            class="hyperlink"
            onclick="window.open('https://github.com/Apollo199999999/cep-wa1-typeracer', '_blank', 'noopener');"
            variant="hyperlink">
            GitHub repository
        </Button>
        <Button
            class="hyperlink"
            onclick="window.open('https://cheerful-scabiosa-05d.notion.site/CEP-WA1-Typeracer-Game-Portfolio-ffd1182cfcd443f6a437e27761413d9d', '_blank', 'noopener');"
            variant="hyperlink">
            Portfolio page
        </Button>
    </div>

</body>

<style lang="scss">
    @use "./src/styles"; 
</style>
