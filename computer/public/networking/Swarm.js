const crypto = require('crypto')
const Swarm = require('discovery-swarm')
const defaults = require('dat-swarm-defaults')
const getPort = require('get-port')
const os = require('os')
const COPYCAT_CHANNEL = "COPYCAT_APPLICATION_06072019_1326"

const DataTypes = {
    DATA_GREETING: 1,
    DATA_TEXT: 2
}

class CopycatSwarm {
    constructor() {
        this.id = crypto.randomBytes(32)
        this.config = defaults({
            id: this.id
        })
        this.swarm = Swarm(this.config)
        this.totalConnections = 0;
        this.peers = {}
        this._ondata = undefined
        this.deviceName = `${os.userInfo().username}(${os.platform()})`
    }

    setOnDataListener(listener) {
        this._ondata = listener;
    }

    newConnection(conn, info) {
        // Connection id
        const connectionId = ++this.totalConnections

        const peerId = info.id.toString('hex')
        console.log(`Connected #${connectionId} to peer: ${peerId}`)

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
            let { type, content } = JSON.parse(data)
            if (type == DataTypes.DATA_GREETING) {
                this.peers[peerId].name = content
            } else {
                if (this._ondata !== undefined) {
                    this._ondata(content)
                }
            }
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
        if (!this.peers[peerId]) {
            this.peers[peerId] = {}
        }
        this.peers[peerId].conn = conn
        this.peers[peerId].info = info
        this.peers[peerId].connectionId = connectionId
        conn.write(JSON.stringify({
            type: DataTypes.DATA_GREETING,
            content: this.deviceName
        }))
    }

    broadcast(data) {
        for (const id in this.peers) {
            if (this.peers.hasOwnProperty(id)) {
                const peer = this.peers[id];
                peer.conn.write(JSON.stringify({
                    type: DataTypes.DATA_TEXT,
                    content: data
                }))
            }
        }
    }

    async start() {
        const port = await getPort();
        this.swarm.listen(port)
        console.log("Copycat swarm starts listenin on port:", port)
        this.swarm.join(COPYCAT_CHANNEL)
        this.swarm.on('connection', this.newConnection.bind(this))
    }

}

module.exports = CopycatSwarm;