<script>
    //import components from Fluent Svelte
    import { Button, RadioButton, ContentDialog } from "fluent-svelte";

    //#region Variable declarations

    //variable to keep track of passage type
    let passageIsRandomWords = true;

    //variable to keep track of whether the settings dialog is open or not
    let settingsDialogIsOpen = false;

    //variable to keep track of the amount of time per game that the user has selected
    let gameTime = 30;

    //#endregion
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


</body>

<style lang="scss">
    @use "./styles"; 
</style>
