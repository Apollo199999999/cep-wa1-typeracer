<script>
    //import components from Fluent Svelte
    import { Button, RadioButton } from "fluent-svelte";

    //variable to keep track of passage type
    let passageIsRandomWords = false;
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
            <Button variant="accent">Settings</Button>
       </div>

    </div>
</body>

<style lang="scss">
    @use "./styles"; 
</style>
