'use strict';

var scanPorts = require('./');

// http://192.168.{range1...}.{range2...}
scanPorts({
    poolSize: 100,
    //Range1: [10, 300],
    //Range2: [10, 300]
    range1: [0, 300],
    range2: [0, 300],
    ports: [80, 8080, 1337, 4040, 3000, 9000]
}, function (result) {
    //console.log('done?');
});