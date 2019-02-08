const noble = require('noble-mac');
const easymidi = require('easymidi');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const POWERED_ON = 'poweredOn';
const portNumber = process.env.BLE_PORT || 3000;
const SCAN_TIMEOUT = 60000;
// make multiples of these when you get a chance
// const midiOuts = [];
const output = new easymidi.Output(`SP Midi Output`, true);
let currentPeripherals = [];
let connectedPeripherals = [];
let currentCharacteristics = [];
let currentState;
let scanning = false;

const stopBleScanning = () => {
    if (scanning) {
        noble.stopScanning(() => console.log('Stop scanning'));
        io.emit('scanning', false);
        scanning = false;
    }
};


const startBleScanning = () => {
    if (currentState === POWERED_ON && !scanning) {
        scanning = true;
        currentPeripherals = [];
        noble.startScanning([], false, () => console.log('Start scanning'));
        io.emit('scanning', true);
        setTimeout(stopBleScanning, SCAN_TIMEOUT);
    }
}

let interval;
noble.on('stateChange', function(state) {
    currentState = state;
    if (state === POWERED_ON) {
        startBleScanning();
    } else {
        stopBleScanning();
    }
});

noble.on('discover', function(peripheral) {
    currentPeripherals.push(peripheral);
    emitPeripherals();
});

const emitPeripherals = function () {
    const allowed = ['id', 'uuid', 'address', 'addressType', 'connectable', 'rssi', 'advertisement'];
    io.emit(
      'peripherals',
      currentPeripherals
        .filter(peripheral =>
          peripheral.advertisement
          && peripheral.advertisement.serviceUuids
          && peripheral.advertisement.serviceUuids.length)
        .map(peripheral => {
          return Object.keys(peripheral)
              .filter(key => allowed.includes(key))
              .reduce((obj, key) => {
                  obj[key] = peripheral[key];
                  return obj;
              }, {});
        })
    );
}

/* app.use(function(req,res,next){
    req.io = io;
    next();
}); */

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

/* app.post('/scan/start', function () {
    if (currentState !== POWERED_ON)
    currentPeripherals = [];
    noble.startScanning();
    scanning = true;
    setTimeout(stopBleScanning, req.body.duration || 15000);
    res.status(201).send('scanning');
});

app.post('/scan/stop', function () {
    stopBleScanning();
    res.status(201).send('scanning stopped');
}); */

io.on('connection', function(socket){
    currentSocket = socket;
    console.log('a user connected');
});

http.listen(portNumber, function(){
    console.log('listening on *:3000');
});

io.on('scan', () => {
  stopBleScanning();
  startBleScanning();
  emitPeripherals();
});

app.post('/peripherals/:peripheralId', function ({ params }, res) {
    // look for peripheral in scanning list by ID
    const peripheral = currentPeripherals.find(peripheral => peripheral.id === params.id);
    if (!peripheral) {
        return res.status(400).json({ message: 'Peripheral does not exist!' });
    }

    peripheral.connect(function (error) {
        if (error) {
            return res.status(400).json(error || { message: 'Peripheral cannot connect!' });
        }
        connectedPeripherals.push({ peripheral, id: peripheral.id });
        res.status(201).send('peripheral connected');
    });
});

app.post('/peripherals/:peripheralId/services/:serviceId', function ({ params }, res) {
    // open the service
    const peripheral = currentPeripherals.find(peripheral => peripheral.id === params.peripheralId);
    if (!peripheral) {
        return res.status(400).json({ message: 'Peripheral does not exist!' });
    }

    peripheral.connect(function (error) {
        if (error) {
            return res.status(400).json(error || { message: 'Peripheral cannot connect!' });
        }

        peripheral.discoverServices([params.serviceId], (error, [ service ]) => {
            if (error || !service) {
                return res.status(400).json(error || { message: 'Some sort of services listing issue!' });
            }

            service.discoverCharacteristics([], (error, characteristics) => {
                if (error) {
                    return res.status(400).json(error || { message: 'Some sort of characteristics listing issue!' });
                }
                currentCharacteristics = characteristics;
                // create peripheral connection?
                connectedPeripherals.push({ peripheral, id: peripheral.id });

                res.status(201).send('characteristics found');
            });
        });
    });
});

app.get('/peripherals/:peripheralId/services/:serviceId/characteristics', function (req, res) {
  const allowed = ['uuid', '_peripheralId', '_serviceUuid', 'uuid', 'properties', 'name', 'type', 'descriptors'];
  res.json(
    currentCharacteristics.map(characteristic => {
      return Object.keys(characteristic)
        .filter(key => allowed.includes(key))
        .reduce((obj, key) => {
            obj[key] = characteristic[key];
            return obj;
        }, {})
    })
  );
});

app.post(
    '/peripherals/:peripheralId/services/:serviceId/characteristics/:characteristicId',
    function (req, res) {
        // add characteristic notifier to peripheral connection
    }
);
