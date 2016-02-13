var nuimo = require('../index');
var spawn = require('child_process').spawn;
var Rx = require('rx');
var os = require('os');

if(os.platform() != 'darwin'){
    throw 'Sorry, this demo only works on a Mac';
}

console.log('SYSTEM VOLUME DEMO');

var handlers = {};
var muted = false;

handlers[nuimo.EVENTS.Connected] = () => {
    console.log('Nuimo Connected!');
    console.log(' - Rotate nuimo to turn system volume up or down');
};

// Idea here was to use Rx to capture some sort of average velocity every X ms
// Not familiar enough with Rx so just using throttle(75)
var observer = undefined;
var source = Rx.Observable.create(o => {
    observer = o;
}).throttle(75);

source.subscribe(amount => {
    var diff = amount;
    if (amount > 0){
        diff = '+ ' + amount;
    }
    var cmd = `set volume output volume (output volume of (get volume settings) ${diff}) --100%`;
    spawn('osascript', ['-e', cmd]);
}, err => console.log('Error: %s', err), () => console.log('Completed'));


handlers[nuimo.CHARACTERISTICS.BUTTON_CLICK] = (nuimo, data) => {
    if (data[0] === 1) {
        muted = !muted;
    }
    if (muted) {
        spawn('osascript', ['-e', "set volume with output muted"]);
    } else {
        spawn('osascript', ['-e', "set volume without output muted"]);
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