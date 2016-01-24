var noble = require('noble');

function Nuimo(handlers) {
    if(arguments.length <= 0){
        throw 'Must pass in handlers object';
    }
    var self = this;
    
    this.handlers = handlers;
    
    this.init = function(){
        noble.on('stateChange', state => {
            if (state === 'poweredOn') {
                noble.startScanning(['180F', '180A'], false);
            } else {
                noble.stopScanning();
            }
        });
        
        noble.on('discover', p => {
            noble.stopScanning();
            p.connect(err => {
                if(err) return;
                p.discoverServices([Nuimo.services.LED_MATRIX,Nuimo.services.USER_INPUT], (err, services) => {
                    for(var service of services){
                        service.discoverCharacteristics(Object.keys(this.handlers), (err, characteristics) => {
                            for(var c of characteristics){
                                if(this.handlers[c.uuid]){
                                    this.handlers[c.uuid](c);
                                }
                            }
                        });
                    }
                });
            });
        });   
    }
    this.init();
}

Nuimo.services = {
    LED_MATRIX: 'f29b1523cb1940f3be5c7241ecb82fd1',
    USER_INPUT: 'f29b1525cb1940f3be5c7241ecb82fd2'
};
Nuimo.characteristics = {
    BATTERY: '00002a1900001000800000805f9b34fb',
    DEVICE_INFO: '00002a2900001000800000805f9b34fb',
    LED_MATRIX: 'f29b1524cb1940f3be5c7241ecb82fd1',
    ROTATION: 'f29b1528cb1940f3be5c7241ecb82fd2',
    BUTTON_CLICK: 'f29b1529cb1940f3be5c7241ecb82fd2',
    SWIPE: 'f29b1527cb1940f3be5c7241ecb82fd2',
    FLY: 'f29b1526cb1940f3be5c7241ecb82fd2'
};

Nuimo.createDataForLedMatrix = function(data, brightness, duration){
    if(arguments.length != 3){
        throw 'createDataForLedMatrix requires three arguments';
    }
    
    var strData = '';
    if(data instanceof Array){
        strData = data.join('');
    } else {
        strData = data;
    }
    var tempArr = strData.split('').filter(x => x === '1' || x === '0');
    
    if(strData.length != 81)
        throw 'data must be 81 bits';
    if(brightness < 0 || brightness > 255)
        throw 'brightness must be between 0 and 255';
    if(duration < 0 || duration > 255)
        throw 'duration must be between 0 and 255';
    
    var output = [];
    
    while(tempArr.length > 0){
        var temp = parseInt(tempArr.splice(0,8).reverse().join(''), 2);
        output.push(temp);
    }
    
    output.push(brightness);
    output.push(duration);
    
    return new Buffer(output);
}

module.exports = Nuimo;  
    