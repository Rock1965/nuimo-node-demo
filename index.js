var Nuimo = require('./nuimo');

var handlers = {};
handlers[Nuimo.characteristics.BUTTON_CLICK] = characteristic => {
    console.log('listening for button clicks...');
    characteristic.on('read', (data, isNotification)=>{
        var dir = data[0] == 1 ? 'UP' : 'DOWN';
        console.log('Button '+ dir);
    });
    characteristic.notify(true);
};

handlers[Nuimo.characteristics.ROTATION] = characteristic => {
    console.log('listening for rotation...');
    characteristic.on('read', (data, isNotification)=>{
        var rotateVal = data[0];
        var dir = data[1] == 255 ? 'Left' : 'Right';
        console.log(dir + ': ' + rotateVal);
    });
    characteristic.notify(true);
};

handlers[Nuimo.characteristics.FLY] = characteristic => {
    console.log('listening for fly...');
    var dirs = ['Left', 'Right', 'Backwards', 'Towards'];
    characteristic.on('read', (data, isNotification)=>{
        console.log('Fly: ' + dirs[data[0]]);
    });
    characteristic.notify(true);
};

handlers[Nuimo.characteristics.SWIPE] = characteristic => {
    console.log('listening for swipe...');
    var dirs = ['Left', 'Right', 'Up', 'Down'];
    characteristic.on('read', (data, isNotification)=>{
        console.log('Swipe: ' + dirs[data[0]]);
    });
    characteristic.notify(true);
};

var nuimo = new Nuimo(handlers);