var Nuimo = require('./nuimo');
var spawn = require('child_process').spawn;
var Rx = require('rx');
var os = require('os');

if(os.platform() != 'darwin'){
    throw 'Sorry, this demo only works on a Mac';
}

var handlers = {};
handlers[Nuimo.characteristics.BUTTON_CLICK] = characteristic => {
    var muted = false;

    characteristic.on('read', (data, isNotification) => {
        if (data[0] === 1) {
            muted = !muted;
        }
        if (muted) {
            spawn('osascript', ['-e', "set volume with output muted"]);
        } else {
            spawn('osascript', ['-e', "set volume without output muted"]);
        }
    });
    characteristic.notify(true);
};

handlers[Nuimo.characteristics.ROTATION] = characteristic => {
    console.log('listening for rotation...');
    
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
        if (amount > 0){
            diff = '+ ' + amount;
        }
        var cmd = `set volume output volume (output volume of (get volume settings) ${diff}) --100%`;
        spawn('osascript', ['-e', cmd]);
    }, err => console.log('Error: %s', err), () => console.log('Completed'));
};

var nuimo = new Nuimo(handlers);