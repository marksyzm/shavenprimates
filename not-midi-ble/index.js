var async = require('async');
// var noble = require('noble');
var noble = require('noble-mac');
var easymidi = require('easymidi');
var output = new easymidi.Output(`Mark's MIDI Output!!!`, true);

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  if (peripheral.advertisement.localName !== 'marktest') { return; }
  console.log('peripheral discovered (' + peripheral.id +
              ' with address <' + peripheral.address +  ', ' + peripheral.addressType + '>,' +
              ' connectable ' + peripheral.connectable + ',' +
              ' uuid ' + peripheral.uuid + ',' +
              ' RSSI ' + peripheral.rssi + ':');
  console.log('\thello my local name is:');
  console.log('\t\t' + peripheral.advertisement.localName);
  console.log('\tcan I interest you in any of the following advertised services:');
  console.log('\t\t' + JSON.stringify(peripheral.advertisement.serviceUuids));

  var serviceData = peripheral.advertisement.serviceData;
  if (serviceData && serviceData.length) {
    console.log('\there is my service data:');
    for (var i in serviceData) {
      console.log('\t\t' + JSON.stringify(serviceData[i].uuid) + ': ' + JSON.stringify(serviceData[i].data.toString('hex')));
    }
  }
  if (peripheral.advertisement.manufacturerData) {
    console.log('\there is my manufacturer data:');
    console.log('\t\t' + JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex')));
  }
  if (peripheral.advertisement.txPowerLevel !== undefined) {
    console.log('\tmy TX power level is:');
    console.log('\t\t' + peripheral.advertisement.txPowerLevel);
  }

  if (peripheral.id === 'edbad2fc55aa488ab756c56ff6db7fd9') {
    peripheral.connect(function(error) {
      console.log('connected to peripheral: ' + peripheral.uuid);
      peripheral.discoverServices(['fe84'], (err, [ service ]) => {
        console.log('service', err, service);
        service.discoverCharacteristics(['2d30c082f39f4ce6923f3484ea480596'], function(error, [ characteristic ]) {
          console.log("characteristic", characteristic);
          // requestNotify(characteristics[0]); //this is the first scratch characteristic.
          characteristic.on('read', function(data, isNotification) {
            const value = (data[1] << 8) + data[0];
            console.log("value is " + value);

            const cBottom = 48;
            const range = 36;
            const multiplier = (value - (value > 1024 ? 1034 : 10)) / 1014;

            const note = {
              note: Math.round(cBottom + range * multiplier),
              velocity: 127,
              channel: 0
            };
            console.log(note);
            output.send('noteon', note);
            setTimeout(() => output.send('noteoff', note), 1000);
          });
        
          characteristic.notify(true, function(error) {
            console.log('turned on notifications ' + (error ? ' with error' : 'without error'));
          });
        });
      });
    });
  }
});

