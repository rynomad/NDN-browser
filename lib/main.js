
var nfd = new Worker('./nfd-worker.js');

var ndn = require('ndn-browser-shim')


ndn.keygen = require('./ndn-keygen.js');
ndn.rtc = require('./ndn-rtc.js');
ndn.io = require('./ndn-io.js');
ndn.dc = require('./ndn-dc.js');
ndn.dc.accessDaemon(nfd);
ndn.x = require('./ndn-x.js');
ndn.utils = require('./utils.js')
ndn.cache = require('./ndn-cache.js')
ndn.fd = nfd;
//ndn.th = require('./ndn-telehashTransport.js')
var initmc = new MessageChannel()

ndn.init = function(opts) {

  opts.init = false;
  var keyPort = new MessageChannel()
  nfd.postMessage({port: "keyPort"},[keyPort.port2])

  xinit = function(id, cert, priPem, pubPem){
    ndn.x.init(nfd, id)
    ndn.id = id
    ndn.io.accessDaemon(nfd, cert, priPem, pubPem)
    //console.log('posting message to app')
    initmc.port1.postMessage('up')
    //ndn.th.init(ndn, priPem, pubPem);
    ndn.globalKeyManager.certificate = cert
    ndn.globalKeyManager.publicKey = pubPem
    ndn.globalKeyManager.privateKey = priPem

    opts.init = true;
    nfd.postMessage(opts);
    ndn.r = new Worker('./ndn-repo.js');

    var repoPort = new MessageChannel()
    ndn.r.postMessage({uri: opts.prefix }, [repoPort.port1])
    nfd.postMessage({port: "repoPort"}, [repoPort.port2])

  }
  ndn.keygen.init(keyPort.port1, xinit);

}

ndn.initport = initmc.port2


window.control = ndn



module.exports = ndn;

ndn.init({prefix: 'wiki'})



