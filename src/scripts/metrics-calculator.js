export class metricsCalculatorClass {
    formatDecimal(decimal) {
        //init a decimalformatter
        const decimalFormatter = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,      
            maximumFractionDigits: 2,
        });

        return decimalFormatter.format(decimal);
    }

    //functions to calculate metrics
    //refer to this: https://matthiaswang.notion.site/CEP-WA1-Typeracer-Game-Portfolio-ffd1182cfcd443f6a437e27761413d9d#971081aa17f4446b8c22069c4a7332dc
    calculateWPM(correctCharCount, timeTaken) {
        let wpm = (correctCharCount / 5) / (timeTaken / 60);
        return this.formatDecimal(wpm);
    }

    calculateRawWPM(totalCharCount, timeTaken) {
        let rawWPM = (totalCharCount / 5) / (timeTaken / 60);
        return this.formatDecimal(rawWPM);
    }

    calculateTypingAccuracy(correctCharCount, totalCharCount) {
        let accuracy = (correctCharCount / totalCharCount) * 100;
        return this.formatDecimal(accuracy);
    }

}