var noble = require('noble');
var spawn = require('child_process').spawn;
var Rx = require('rx');

var numio = {};
numio.services = {};
numio.services.LED_MATRIX = 'f29b1523cb1940f3be5c7241ecb82fd1';
numio.services.USER_INPUT = 'f29b1525cb1940f3be5c7241ecb82fd2';
numio.characteristics = {};
numio.characteristics.BATTERY = '00002a1900001000800000805f9b34fb';
numio.characteristics.DEVICE_INFO = '00002a2900001000800000805f9b34fb';
numio.characteristics.LED_MATRIX = 'f29b1523cb1940f3be5c7241ecb82fd1';
numio.characteristics.ROTATION = 'f29b1528cb1940f3be5c7241ecb82fd2';
numio.characteristics.BUTTON_CLICK = 'f29b1529cb1940f3be5c7241ecb82fd2';

var handlers = {};
handlers[numio.characteristics.BUTTON_CLICK] = characteristic => {
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

handlers[numio.characteristics.ROTATION] = characteristic => {
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

console.log('Running...');

noble.on('stateChange', state => {
    if (state === 'poweredOn') {
        noble.startScanning(['180F', '180A'], false);
    } else {
        noble.stopScanning();
    }
});

noble.on('discover', p => {
    console.log('discovered device');
    noble.stopScanning();
    p.connect(err => {
        if (err) return;
        p.discoverServices([numio.services.USER_INPUT], (err, services) => {
            for (var service of services) {
                service.discoverCharacteristics(Object.keys(handlers), (err, characteristics) => {
                    for (var c of characteristics) {
                        if (handlers[c.uuid]) {
                            handlers[c.uuid](c);
                        }
                    }
                });
            }
        });
    });
});