var diceroll    = document.getElementById('diceroll'),
    results     = document.getElementById('results'),
    intro       = document.getElementById('intro'),
    lastRolls   = document.getElementById('lastRolls').getElementsByTagName('ul')[0],
    currentRoll = null,
    recognition

try {
    recognition = new webkitSpeechRecognition()
} catch (e) {}

if (recognition) {
    recognition.continuous = true
    recognition.onresult = function (event) {
        var resultIndex = event.resultIndex,
            result = event.results[resultIndex]
        requestRoll(result[0].transcript)
    }
    recognition.onspeechstart = function () {
        console.log('Some sound is being received');
    }
    recognition.onspeechend = function () {
        console.log('Some sound is being ended');
        recognition.stop();
    }
    recognition.onerror = function (event) {
        console.log('here');
        console.log(event);
        recognition.stop();
    }
    recognition.onend = function (event) {
        try {
            recognition.start();
        } catch (e) {

        }
    }
    recognition.lang = 'en-US'
    recognition.start()
} else {
    intro.getElementsByTagName('div')[0].innerText = 'Dicebot currently only supports Chrome.'
    intro.className = ''
}

function requestRoll(phrase) {
    console.log(phrase)
    fetch('/listen?q=' + phrase).then(function (response) {
        response.json().then(function (obj) {
            if (obj && !obj.fail) {
                intro.className = 'hidden'
                processRoll(obj)
            }
        })
    })
}

function processRoll(roll) {

    var maxroll = parseInt(roll.diceroll.slice(1), 10),
        delay = 100

    if (roll.count > 1) {
        diceroll.innerHTML = roll.count + '<strong>' + roll.diceroll + '</strong>'
    } else {
        diceroll.innerHTML = '<strong>' + roll.diceroll + '</strong>'
    }

    results.innerHTML = ''
    if (roll.results.length > 1) {
        roll.results.forEach(function (resultData) {
            var div = document.createElement('div')
            div.innerText = 0
            results.appendChild(div)
            setTimeout(function () {
                $(div).animateNumber({ number: resultData })
            }, delay)
            //delay += 200
        })
        results.style.display = 'flex'
    } else {
        results.style.display = 'none'
    }

    result.innerText = 0
    setTimeout(function () {
        $(result).animateNumber({ number: roll.result })
    }, delay)

    if (currentRoll) {
        addLastRoll(currentRoll)
    }
    currentRoll = roll

}

function addLastRoll(roll) {

    var lis = lastRolls.getElementsByTagName('li'),
        li = document.createElement('li')

    if (lis.length > 4) {
        for (var i = 4; i < lis.length; i++) {
            lastRolls.removeChild(lis[i])
        }
    }

    li.innerText = roll.result + ' (' + roll.count + roll.diceroll + ')'

    lastRolls.insertBefore(li, lastRolls.firstChild)
    document.getElementById('lastRolls').style.display = 'block'

}
