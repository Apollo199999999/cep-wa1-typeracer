export class wordHighlightingFunctionsClass {
    //helper function to determine if an element is hidden by overflow
    isVerticallyVisible (parent, child) {
        return !(child.getBoundingClientRect().top - parent.getBoundingClientRect().top > parent.clientHeight);
    }

    tryFlagWord() {
        //get the span which is currently highlighted
        var elements = document.getElementsByClassName("word-highlighted");
        var span = elements[0];

        if (span != null) {
            //modify the classes of the span element so that it takes on the word-error class instead, where the background is highlighted red
            span.classList.remove("word-highlighted");
            span.classList.add("word-error");
        }
    }

    tryUnflagWord() {
        //restore the grey highlighted state of the word in the passage
        //get the span which is currently flagged as an error
        var elements = document.getElementsByClassName("word-error");
        var span = elements[0];

        if (span != null) {
            //modify the classes of the span element so that it takes on the word-highlighted class instead, where the background is highlighted grey                span.classList.remove("word-error");
            span.classList.add("word-highlighted");
        }
    }

    highlightCompletedWord(span, inputBoxText, correctWord) {
        //get all elements with either the "word-highlighted" class or the "word-error" class (which would return the current span), and remove both classes from the span
        //this removes the highlighting and error flagging from the word
        span.classList.remove("word-highlighted");
        span.classList.remove("word-error");

        //next, depending on if the word the user typed is correct, make the text color of the word red or green
        let inputBoxTextWithoutSpace = inputBoxText.substring(0, inputBoxText.length - 1);

        if (inputBoxTextWithoutSpace == correctWord) {
            span.classList.add("word-correct");

            //return length of inputboxtext, to be added to correct character count
            return inputBoxText.length;
        }
        else {
            span.classList.add("word-wrong");
            return 0;
        }
    }

    highlightNextWord(currentWordSpan) {
        //get the next span
        var nextSpan = currentWordSpan.nextElementSibling;

        //if the next span is null, it means that the user has reached the end of the quote. Show game over screen
        if (nextSpan == null) {
            return false;
        }
        
        //highlight the next word
        nextSpan.classList.add("word-highlighted");

        //if the next word is out of view, scroll the passage div manually to bring it into view
        if (this.isVerticallyVisible(passageDiv, nextSpan) == false) {
            passageDiv.scrollTop += (200 - 16 - 16);
        }

        return true;
    }
}