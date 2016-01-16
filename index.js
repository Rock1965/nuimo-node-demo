var noble = require('noble');

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
numio.characteristics.SWIPE = 'f29b1527cb1940f3be5c7241ecb82fd2';
numio.characteristics.FLY = 'f29b1526cb1940f3be5c7241ecb82fd2';

var handlers = {};
handlers[numio.characteristics.BUTTON_CLICK] = characteristic => {
    console.log('listening for button clicks...');
    characteristic.on('read', (data, isNotification)=>{
        var dir = data[0] == 1 ? 'UP' : 'DOWN';
        console.log('Button '+ dir);
    });
    characteristic.notify(true);
};

handlers[numio.characteristics.ROTATION] = characteristic => {
    console.log('listening for rotation...');
    characteristic.on('read', (data, isNotification)=>{
        var rotateVal = data[0];
        var dir = data[1] == 255 ? 'Left' : 'Right';
        console.log(dir + ': ' + rotateVal);
    });
    characteristic.notify(true);
};

handlers[numio.characteristics.FLY] = characteristic => {
    console.log('listening for fly...');
    var dirs = ['Left', 'Right', 'Backwards', 'Towards'];
    characteristic.on('read', (data, isNotification)=>{
        console.log('Fly: ' + dirs[data[0]]);
    });
    characteristic.notify(true);
};

handlers[numio.characteristics.SWIPE] = characteristic => {
    console.log('listening for swipe...');
    var dirs = ['Left', 'Right', 'Up', 'Down'];
    characteristic.on('read', (data, isNotification)=>{
        console.log('Swipe: ' + dirs[data[0]]);
    });
    characteristic.notify(true);
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
        if(err) return;
        p.discoverServices([numio.services.USER_INPUT], (err, services) => {
            for(var service of services){
                service.discoverCharacteristics(Object.keys(handlers), (err, characteristics) => {
                    for(var c of characteristics){
                        if(handlers[c.uuid]){
                            handlers[c.uuid](c);
                        }
                    }
                });
            }
        });
    });
});