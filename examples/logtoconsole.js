var nuimo = require('../index');

var handlers = {};

console.log('LOG TO CONSOLE DEMO');

handlers[nuimo.EVENTS.Connected] = () => {
    console.log('Nuimo Connected!');
    console.log('Events from the device will be logged to the console');  
};

handlers[nuimo.CHARACTERISTICS.BUTTON_CLICK] = (nuimo, data) => {
    var dir = data[0] == 1 ? 'UP' : 'DOWN';
    console.log('Button '+ dir);
};

handlers[nuimo.CHARACTERISTICS.ROTATION] = (nuimo, data) => {
    var rotateVal = data[0];
    var dir = data[1] == 255 ? 'Left' : 'Right';
    console.log(dir + ': ' + rotateVal);
};

handlers[nuimo.CHARACTERISTICS.FLY] = (nuimo, data) => {
    var dirs = ['Left', 'Right', 'Backwards', 'Towards'];
    console.log('Fly: ' + dirs[data[0]]);
};

handlers[nuimo.CHARACTERISTICS.SWIPE] = (nuimo, data) => {
    var dirs = ['Left', 'Right', 'Up', 'Down'];
    console.log('Swipe: ' + dirs[data[0]]);
};

nuimo.init(handlers);