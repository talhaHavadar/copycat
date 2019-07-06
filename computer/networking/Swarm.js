const crypto = require('crypto')
const Swarm = require('discovery-swarm')
const defaults = require('dat-swarm-defaults')
const getPort = require('get-port')
const COPYCAT_CHANNEL = "COPYCAT_APPLICATION_06072019_1326"

class CopycatSwarm {
    constructor() {
        this.id = crypto.randomBytes(32)
        this.config = defaults({
            id: this.id
        })
        this.swarm = Swarm(this.config)
        this.totalConnections = 0;
        this.peers = {}
    }

    newConnection(conn, info) {
        // Connection id
        console.log("conn", conn, "info", info)
        const connectionId = ++this.totalConnections

        const peerId = info.id.toString('hex')
        log(`Connected #${connectionId} to peer: ${peerId}`)

        // Keep alive TCP connection with peer
        if (info.initiator) {
            try {
                conn.setKeepAlive(true, 600)
            } catch (exception) {
                console.error(exception)
            }
        }

        conn.on('data', data => {
            console.log('Received Message from peer', peerId, '---->', data.toString())
        })

        conn.on('close', () => {
            // Here we handle peer disconnection
            console.log(`Connection ${connectionId} closed, peer id: ${peerId}`)
            // If the closing connection is the last connection with the peer, removes the peer
            if (this.peers[peerId].connectionId === connectionId) {
                delete this.peers[peerId]
            }
        })

        // Save the connection
        if (!peers[peerId]) {
            peers[peerId] = {}
        }
        peers[peerId].conn = conn
        peers[peerId].connectionId = connectionId
    }

    async start() {
        const port = await getPort();
        this.swarm.listen(port)
        console.log("Copycat swarm starts listenin on port:", port)
        this.swarm.join(COPYCAT_CHANNEL)
        this.swarm.on('connection', this.newConnection)
    }

}

module.exports = CopycatSwarm;