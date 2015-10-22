'use strict';

var cliInterface = require('./interface'),
    request = require('request'),
    Promise = require('bluebird'),
    pRequest = Promise.promisifyAll(request),
    _ = require('lodash'),
    util = require('util');

module.exports = scanPorts;

function scanPorts(opts /*object*/, callback /*function*/) {
    _.defaultsDeep(opts, {
        range1: [0, 10],
        range2: [0, 10],
        poolSize: 5,
        ports: [80],
        timeout: 2000
    });

    var URL_TEMPLATE = 'http://192.168.%s.%s',
        killed = false,
        i = opts.range1[0] + 0,
        iUpper = opts.range1[1],
        j = opts.range2[0] + 0,
        jUpper = opts.range2[1],
        completed = 0,
        successful = [],
        portsLen = opts.ports.length,
        totalIps = getTotalIps(opts.range1, opts.range2),
        totalRequests = totalIps * ((portsLen > 0) ? portsLen : 1),
        startMsg = util.format("Starting IP scan against %d unique IPs using %d port(s) (%d total requests)", totalIps, portsLen, totalRequests);

    // ======= interface
    var timer;
    var ui = cliInterface.create(startMsg, function onExit() {
        killed = true;
        clearTimeout(timer);
        return process.exit(0);
    });

    function updateScreen() {
        var percent = (completed / totalRequests) * 100;
        if (percent >= 100) {
            clearTimeout(timer);
        }
        var msg = util.format("Completed %d of %d calls", completed, totalRequests);
        ui.box.setContent(msg);
        //ui.progressbar.content = Math.ceil(percent);
        ui.progressbar.setProgress(percent);
        ui.screen.render();
    }

    (function updateLoop() {
        updateScreen();
        timer = setTimeout(updateLoop, 500);
    })();


    function done() {
        updateScreen();

        if (!!callback) {
            callback(successful, successful.length, i, j);
        }
    }

    // ============  work to be done at each loop iteration

    function makePooledRequests(p1, p2) {

        function addResult(url, type) {
            return function _addResult() {
                completed++;
                var result = {url: url, err: arguments[0], response: null, body: null};
                if (type === "success") {
                    result = {url: url, err: null, response: arguments[0], body: arguments[1]};
                    ui.list.addItem(url);
                    successful.push(result);
                    ui.screen.debug(type + ' ' + url);
                }
                updateScreen();
                return result;
            };
        }

        function requestPromise(url) {
            return pRequest.getAsync(url, {timeout: opts.timeout})
                .spread(addResult(url, "success"))
                .catch(addResult(url, "failed"));
        }

        var rangeTop = (p2 + opts.poolSize) > jUpper ? jUpper : (p2 + opts.poolSize);
        var range = _.range(p2, rangeTop);
        var requests = Promise.map(range, function (k) {
            var url = util.format(URL_TEMPLATE, p1, k);
            if (opts.ports.length < 1) {
                return requestPromise(url);
            }
            return Promise.map(opts.ports, function (port) {
                var portedUrl = url + ":" + port;
                return requestPromise(portedUrl);
            });
        });

        return Promise.settle(requests).then(function (results) {
            return successful;
        });
    }


    //=========== main work loop

    (function loop() {
        if (i > iUpper) {
            return done();
        }

        makePooledRequests(i + 0, j + 0).then(function () {
            if (killed) return;

            if (j < jUpper) {
                j += opts.poolSize;
            } else {
                j = 0;
                i++;
            }

            loop();
        }).catch(done);

        if (killed) {
            done();
        }
    })();
}

// estimate how many IPs we're going to request
// (just ip addresses, not ip:port)
function getTotalIps(range1, range2) {
    var r1 = 1,
        r2 = 1;

    if (range1[1] - range1[0] === 1) {
        // case: 0-1
        r1 += 1;
    } else if (range1[1] - range1[0] > 1) {
        //case: 0-0
        r1 = range1[1] - range1[0];
    }

    if (range2[1] - range2[0] === 1) {
        r2 += 1;
    } else if (range2[1] - range2[0] > 1) {
        r2 = range2[1] - range2[0];
    }
    return r1 * r2;

}