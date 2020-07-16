const os = require('os')
const ifaces = os.networkInterfaces()

// Listar las IP de las interfaces de red.
module.exports = function () {
  let ip = 'localhost'
  Object.keys(ifaces).forEach((ifname) => {
    // "VirtualBox Host-Only Network"
    if (/(VirtualBox|vmnet0)/.test(ifname)) return
    ifaces[ifname].forEach((iface) => {
      // skip non-ipv4 addresses
      // skip over internal (i.e. 127.0.0.1)
      if (iface.family !== 'IPv4' || iface.internal !== false) return
      // console.log("IP found", ifname, iface.address);
      ip = iface.address
    })
  })
  console.log(`External access on http://${ip}:${process.env.PORT || 3000}`)
}
