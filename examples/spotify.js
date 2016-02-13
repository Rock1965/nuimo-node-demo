var nuimo = require('../index');
var spawn = require('child_process').spawn;
var Rx = require('rx');
var os = require('os');
var ledImages = require('./images');

if(os.platform() != 'darwin'){
    throw 'Sorry, this demo only works on a Mac';
}

console.log('SPOTIFY DEMO');

var handlers = {};
var playing = true;

// Idea here was to use Rx to capture some sort of average velocity every X ms
// Not familiar enough with Rx so just using throttle(75)
var observer;
var source = Rx.Observable.create(o => {
    observer = o;
}).throttle(75);

source.subscribe(amount => {
    var diff = amount;
    var func = 'my max(0, ';
    if (amount > 0){
        nuimo.writeToLEDs(ledImages.up);
        diff = '+ ' + amount;
        func = 'my min(100, ';
    } else {
        nuimo.writeToLEDs(ledImages.down);
    }
    // AppleScript is new to me...
    // not sure if better way of calc'ing min/max
    var funcs = [
        'on min(x, y)',
        '    if x ≤ y then',
        '        return x',
        '    else',
        '        return y',
        '    end if',
        'end min',
        '',
        'on max(x, y)',
        '    if x > y then',
        '        return x',
        '    else',
        '        return y',
        '    end if',
        'end min',
        ''
    ];
    
    var cmd = funcs.join('\n') + `tell application "Spotify" to set sound volume to ${func}(get sound volume ${diff}))`;
    spawn('osascript', ['-e', cmd]);
}, err => console.log('Error: %s', err), () => console.log('Completed'));

handlers[nuimo.EVENTS.Connected] = () => {
    console.log('Nuimo Connected!');
    console.log(' - Press nuimo button to play/pause');
    console.log(' - Swipe on numio to go to next track or go to previous track');
    console.log(' - Rotate nuimo to turn spotify volume up or down');
};

handlers[nuimo.CHARACTERISTICS.BUTTON_CLICK] = (nuimo, data) => {    
    if (data[0] === 1) {
        playing = !playing;
        nuimo.writeToLEDs(playing ? ledImages.play : ledImages.pause);
        spawn('osascript', ['-e', 'tell application "Spotify" to playpause']);
    }
};

handlers[nuimo.CHARACTERISTICS.SWIPE] = (nuimo, data) => {
    switch(data[0]){
        case 0:
        case 2:
            var cmd = 'tell application "Spotify" to previous track';
            // twice - the first to go to beginning of track
            //         the second to go to previous track
            spawn('osascript', ['-e', `${cmd}\n${cmd}`]);
            nuimo.writeToLEDs(ledImages.previous);
            break;
        default:
        spawn('osascript', ['-e', 'tell application "Spotify" to next track']);
            nuimo.writeToLEDs(ledImages.next);
            break;
    }
};

handlers[nuimo.CHARACTERISTICS.ROTATION] = (nuimo, data) => {
    if (data[1] === 255) {
        var velocity = Math.round((255 - data[0]) / 255 * 100);
        observer.onNext(-velocity);
    } else {
        var velocity = Math.round(data[0] / 255 * 100);
        observer.onNext(velocity);
    }
};

nuimo.init(handlers);