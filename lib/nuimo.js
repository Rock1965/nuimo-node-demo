var noble = require('noble');

function Nuimo() {
    
    // Private members
    var handlers = undefined;
    var ledMatrix = undefined;
    
    // Public members
    this.createDataForLedMatrix = createDataForLedMatrix;
    this.init = init;
    this.writeToLEDs = writeToLEDs;
    
    this.SERVICES = {
        LED_MATRIX: 'f29b1523cb1940f3be5c7241ecb82fd1',
        USER_INPUT: 'f29b1525cb1940f3be5c7241ecb82fd2'
    };

    this.CHARACTERISTICS = {
        BATTERY: '00002a1900001000800000805f9b34fb',
        DEVICE_INFO: '00002a2900001000800000805f9b34fb',
        LED_MATRIX: 'f29b1524cb1940f3be5c7241ecb82fd1',
        ROTATION: 'f29b1528cb1940f3be5c7241ecb82fd2',
        BUTTON_CLICK: 'f29b1529cb1940f3be5c7241ecb82fd2',
        SWIPE: 'f29b1527cb1940f3be5c7241ecb82fd2',
        FLY: 'f29b1526cb1940f3be5c7241ecb82fd2'
    };

    this.EVENTS = {
        Connected: 'Connected',
        Disconnected: 'Disconnected'
    };
    
    // Implementations:
    function writeToLEDs(data){
        if(ledMatrix){
            ledMatrix.write(data);
        } else {
            console.log("Can't writeToLEDs yet.")
        }  
    };
    
    function createDataForLedMatrix(data, brightness, duration){
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
    
    function init(handlers){
        handlers = handlers;
        
        noble.on('stateChange', state => {
            if (state === 'poweredOn') {
                noble.startScanning(['180F', '180A'], false);
            } else {
                noble.stopScanning();
            }
        });
        
        noble.on('discover', p => {
            p.connect(err => {
                if(err) return;
                if (handlers[this.EVENTS.Connected]){
                    handlers[this.EVENTS.Connected](p);
                }
                p.discoverServices([this.SERVICES.LED_MATRIX, this.SERVICES.USER_INPUT], (err, services) => {
                    for(var service of services){
                        var nuimoChars = Object.keys(this.CHARACTERISTICS).map(prop => this.CHARACTERISTICS[prop]);
                        service.discoverCharacteristics(nuimoChars, (err, characteristics) => {
                            characteristics.forEach(c => {
                                if(c.uuid == this.CHARACTERISTICS.LED_MATRIX){
                                    ledMatrix = c;
                                } 
                                if(handlers[c.uuid]){
                                    if(c.properties.indexOf('notify') > -1){
                                        c.on('read', (data, isNotification) => {
                                            handlers[c.uuid](this, data, c);    
                                        });
                                        c.notify(true);    
                                    } else if (c.properties.indexOf('write') > -1){
                                        handlers[c.uuid](this, c);
                                    }
                                }
                            });
                        });
                    }
                });
            });
            p.once('disconnect', () => {
                if (handlers[this.EVENTS.Disconnected]){
                    handlers[this.EVENTS.Disconnected](p);
                }
                noble.startScanning(['180F', '180A'], false);
            });
        });   
    }
}

module.exports = Nuimo;  
    