var nuimo = require('../index');
var ledImages = require('./images');

var handlers = {};
var current = -1;

console.log('LED MATRIX DEMO');

handlers[nuimo.EVENTS.Connected] = () => {
    console.log('Nuimo Connected!');
    console.log('Use the button on the nuimo controller to cycle through images');  
};

handlers[nuimo.CHARACTERISTICS.BUTTON_CLICK] = (nuimo, data) => {
    if(data[0] == 0){
        var keys = Object.keys(ledImages);
        current = (current+1) % keys.length;
        var key = keys[current];
        console.log('Showing: ' + key);
        nuimo.writeToLEDs(ledImages[key]);
    }
};

nuimo.init(handlers);