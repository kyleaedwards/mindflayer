"use strict";

const natural     = require('natural')
const classifier  = new natural.BayesClassifier()
const tokenizer   = new natural.WordTokenizer()

class Dicebot {

    constructor() {

        var textNumeral = {
            2: 'two',
            3: 'three',
            4: 'four',
            5: 'five',
            6: 'six',
            8: 'eight',
            10: 'ten',
            12: 'twelve',
            16: 'sixteen',
            20: 'twenty',
            100: 'hundred'
        }

        var nums = [2, 3, 4, 6, 8, 10, 12, 16, 20, 100]

        nums.forEach((n) => {
            var cat = "d" + n
            classifier.addDocument("roll a d" + n, cat)
            classifier.addDocument("roll a d " + textNumeral[n], cat)
            classifier.addDocument("roll an " + n + " sided die", cat)
            classifier.addDocument("roll an " + textNumeral[n] + " sided die", cat)
            for (var i = 2; i <= 6; i++) {
                classifier.addDocument("roll " + i + " d" + n, cat)
                classifier.addDocument("roll " + i + " d " + textNumeral[n], cat)
                classifier.addDocument("roll " + textNumeral[i] + " d" + n, cat)
                classifier.addDocument("roll " + textNumeral[i] + " d " + textNumeral[n], cat)
                classifier.addDocument("roll " + i + " " + n + " sided dice", cat)
                classifier.addDocument("roll " + i + " " + textNumeral[n] + " sided dice", cat)
                classifier.addDocument("roll " + textNumeral[i] + " " + n + " sided dice", cat)
                classifier.addDocument("roll " + textNumeral[i] + " " + textNumeral[n] + " sided dice", cat)
            }
        })

        classifier.train()

    }

    analyze(phrase) {

        // hello I'm at a little buggy

        // Separate XdY phrasing.
        phrase = phrase.replace(/\s?(\d+)d\s?(\d+)\s?/, ' $1 d$2 ')

        var minConfidence = 0.25,
            diceroll = classifier.classify(phrase),
            results = classifier.getClassifications(phrase),
            maxroll = parseInt(diceroll.slice(1)),
            iterations = 0,
            output = {},
            value,
            total

        total = results.reduce((prev, curr) => {
            return prev + curr.value
        }, 0)

        if (results[0].value / total < minConfidence) {
            output.fail = true
            output.debug = results
            return output
        }

        output.diceroll = diceroll

        phrase = phrase.replace(/[0-9]+([\s-]+)?sided?/, '')
        phrase = phrase.replace(/\sd(e+)?([\s-]+)?[0-9]+/, '')

        tokenizer.tokenize(phrase).forEach((token) => {
            if (!iterations) {
                iterations = parseInt(token, 10)
            }
        })

        if (!iterations) {
            iterations = 1
        }

        if (iterations > 6) {
            output.fail = true
            return output
        }

        output.count = iterations
        output.results = []
        output.result = 0
        for (var i = 0; i < iterations; i++) {
            value = 1 + Math.floor(Math.random() * maxroll)
            output.result += value
            output.results.push(value)
        }

        //output.debug = results

        return output

    }

}

module.exports = new Dicebot
