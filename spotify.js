var Nuimo = require('./nuimo');
var spawn = require('child_process').spawn;
var Rx = require('rx');
var os = require('os');
var ledImages = require('./spotify_images');

if(os.platform() != 'darwin'){
    throw 'Sorry, this demo only works on a Mac';
}

var handlers = {};
var ledMatrix = undefined;
var playing = true;

handlers[Nuimo.characteristics.LED_MATRIX] = characteristic => {
    ledMatrix = characteristic;
};

handlers[Nuimo.characteristics.BUTTON_CLICK] = characteristic => {
    console.log('listening for button click (play/pause)...');
    characteristic.on('read', (data, isNotification) => {
        if (data[0] === 1) {
            playing = !playing;
            ledMatrix.write(playing ? ledImages.play : ledImages.pause);
            spawn('osascript', ['-e', 'tell application "Spotify" to playpause']);
        }
    });
    characteristic.notify(true);
};

handlers[Nuimo.characteristics.SWIPE] = characteristic => {
    console.log('listening for swipe (next track)...');
    characteristic.on('read', (data, isNotification)=>{
        switch(data[0]){
            case 0:
            case 2:
                var cmd = 'tell application "Spotify" to previous track';
                // twice - the first to go to beginning of track
                //         the second to go to previous track
                spawn('osascript', ['-e', `${cmd}\n${cmd}`]);
                ledMatrix.write(ledImages.previous);
                break;
            default:
            spawn('osascript', ['-e', 'tell application "Spotify" to next track']);
                ledMatrix.write(ledImages.next);
                break;
        }
    });
    characteristic.notify(true);
};

handlers[Nuimo.characteristics.ROTATION] = characteristic => {
    console.log('listening for rotation (volume)...');
    
    // Idea here was to use Rx to capture some sort of average velocity every X ms
    // Not familiar enough with Rx so just using throttle(75)
    var source = Rx.Observable.create(observer => {
        characteristic.on('read', (data, isNotification) => {
            if (data[1] === 255) {
                var velocity = Math.round((255 - data[0]) / 255 * 100);
                observer.onNext(-velocity);
            } else {
                var velocity = Math.round(data[0] / 255 * 100);
                observer.onNext(velocity);
            }
        });
        characteristic.notify(true);
    }).throttle(75);

    source.subscribe(amount => {
        var diff = amount;
        var func = 'my max(0, ';
        if (amount > 0){
            ledMatrix.write(ledImages.up);
            diff = '+ ' + amount;
            func = 'my min(100, ';
        } else {
            ledMatrix.write(ledImages.down);
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
};

var nuimo = new Nuimo(handlers);