(function () {

var currentRoll,
    recognition

try {
    recognition = new webkitSpeechRecognition()
} catch (e) {}

if (!recognition) {
    _('introText').innerText = 'Dicebot currently only supports Chrome.'
    _('intro').className = ''
} else {
    recognition.continuous = true
    recognition.onresult = function (e) {
        recognition.stop()
        request(e.results[e.resultIndex][0].transcript)
    }
    recognition.onerror = function () { recognition.stop() }
    recognition.onend = function () {
        try {
            recognition.start()
        } catch (e) {}
    }
    recognition.lang = 'en-US'
    recognition.start()
}

function request (str) {
    str = str.replace(/rule /, 'roll ')
    str = str.replace('rolligon', 'roll again')
    console.log(str)
    if ((str.indexOf('repeat') !== -1 ||
        (str.indexOf('again') !== -1 && str.indexOf('roll') !== -1)) && currentRoll) {
        return request(currentRoll.phrase)
    }
    fetch('/listen?q=' + str).then(function (res) {
        res.json().then(function (json) {
            if (json && !json.fail) {
                _('intro').className = 'hidden'
                json.phrase = str
                process(json)
            }
        })
    })
}

function process(roll) {

    var diceroll = _('diceroll'),
        results  = _('results'),
        maxroll  = +roll.diceroll.slice(1)
        count    = roll.count > 1 ? roll.count : ''

    diceroll.innerHTML = count + '<strong>' + roll.diceroll + '</strong>'
    results.innerHTML = ''

    if (roll.results.length > 1) {
        roll.results.forEach(function (number) {
            var div = c('div')
            div.className = 'result'
            results.appendChild(div)
            counter(div, number)
        })
        d(results, 'flex')
    } else {
        d(results, 'none')
    }

    counter(result, roll.result)

    if (currentRoll) {
        addLastRoll(currentRoll)
    }
    currentRoll = roll

}

function addLastRoll(roll) {

    var lastRolls = _('lastRolls'),
        lis = lastRolls.getElementsByClassName('roll'),
        li = c('li'),
        count = roll.count > 1 ? roll.count : ''

    li.className = 'roll'
    if (lis.length > 4) {
        for (var i = 4; i < lis.length; i++) {
            lastRolls.removeChild(lis[i])
        }
    }

    li.innerText = roll.result + ' (' + count + roll.diceroll + ')'

    lastRolls.insertBefore(li, lastRolls.firstChild)
    d(_('bottomBar'), 'block')

}

function counter(el, n) {
    var value = 0,
        t = n > 500 ? 0.6 : (n > 20 ? 0.4 : 0.2),
        step = -~(1 / (t * 1000 / n)),
        interval
    el.innerText = 0
    interval = setInterval(function () {
        value += step
        el.innerText = value
        if (value >= n) {
            el.innerText = n
            clearInterval(interval)
        }
    }, ~~(t * 1000 * step / n))
}

function d(el, l) { el.style.display = l }
function c(tag) { return document.createElement(tag) }
function _(id) { return _.cache[id] ? _.cache[id] : (_.cache[id] = document.getElementById(id)) }
_.cache = {}

var lastAvg = 0;

var cube = _('cube')

function updateAnalysers(time) {
    var freqByteData = new Uint8Array(analyserNode.frequencyBinCount)
    analyserNode.getByteFrequencyData(freqByteData)
    var sum = freqByteData.reduce(function (x, y) { return x + y })
    var multiplier = analyserNode.frequencyBinCount
    var avg = ~~(sum/ multiplier)
    if (avg != lastAvg) {
        cube.style.opacity = Math.min(avg / 40, 1)
    }
    rafID = window.requestAnimationFrame( updateAnalysers );
}

window.AudioContext = window.AudioContext || window.webkitAudioContext;

if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!navigator.cancelAnimationFrame)
            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
        if (!navigator.requestAnimationFrame)
            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    navigator.getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream, function(e) {
            alert('Error getting audio');
            console.log(e);
        });

var audioContext = new AudioContext();

function gotStream(stream) {

inputPoint = audioContext.createGain();

    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

//    audioInput = convertToMono( input );

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect( analyserNode );
    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( audioContext.destination );
    updateAnalysers();

}

})()
