'use strict';

var ipScan = require('./');

// http://192.168.{range1...}.{range2...}
ipScan({
    poolSize: 50,
    range1: [0, 200],
    range2: [0, 300],
    ports: [80],
    urlTemplate: 'http://10.1.%s.%s'
}, function (result) {
    //console.log('done?');
});
