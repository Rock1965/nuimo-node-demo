var Nuimo = require('./nuimo');
var Rx = require('rx');

var ledMatrix = undefined;
var ledImages = [];
var handlers = {};
var current = -1;

handlers[Nuimo.characteristics.BUTTON_CLICK] = characteristic => {
    characteristic.on('read', (data, isNotification)=>{
        if(data[0] == 0){
            current = (current+1) % ledImages.length;
            ledMatrix.write(ledImages[current]);
        }
    });
    characteristic.notify(true);
};

handlers[Nuimo.characteristics.LED_MATRIX] = characteristic => {
    console.log('Awaiting button presses...');
    ledMatrix = characteristic;
};

// You can do it this way...
ledImages.push(Nuimo.createDataForLedMatrix(
    [
        '000111000',
        '001111000',
        '000111000',
        '000111000',
        '000111000',
        '000111000',
        '000111000',
        '011111110',
        '011111110',
], 150, 30));


ledImages.push(Nuimo.createDataForLedMatrix(
    [
        '000111000',
        '001111100',
        '011001110',
        '000000110',
        '000000110',
        '000011100',
        '001110000',
        '011111110',
        '011111110',
], 150, 30));

ledImages.push(Nuimo.createDataForLedMatrix(
    [
        '001111100',
        '011101110',
        '000000111',
        '000000111',
        '011111110',
        '000000111',
        '011000111',
        '011101110',
        '001111100',
], 150, 30));

// Also do it this way...
ledImages.push(Nuimo.createDataForLedMatrix(
    [
        1,1,1,1,1,1,1,1,1,
        1,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,1,
        1,1,1,1,1,1,1,1,1
], 50, 10));

ledImages.push(Nuimo.createDataForLedMatrix(
    [
        1,1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,1
], 50, 50));

var nuimo = new Nuimo(handlers);