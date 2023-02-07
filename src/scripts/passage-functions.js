//import library for random word generation
import { words } from '../scripts/random-words.js';

export class passageFunctionsClass {
    //helper function to generate a random word and load it into the passage div
    generateRandomWord(passageDiv, passageWords) {
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
    loadWordsIntoDiv(passageDiv, passageWords) {
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
    async generateRandomQuote() {
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
}