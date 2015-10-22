# ip-scanner
small-ish script for scanning local ips for open http servers

## Example
Calling ipScan can make <poolSize> calls at once, when they have all completed it will call the next range of IPs.
The ipScan function only generates the last 2 positions of the an IP address; basically ```http://xxx.xxx.{range1}.{range2}:{ports}```.

Below are the default values that would be provided if you call ```ipScan``` without any arguments
```javascript
var ipScan = require("ip-scanner");
ipScan({
    range1: [0, 10], // the next to last chunk of an ip address
    range2: [0, 10], // the last chunk of an ip address
    poolSize: 5, // how many requests to make at a time
    ports: [80], // ports to look at for each generated ip
    timeout: 2000 // request timeout duration
});
```
