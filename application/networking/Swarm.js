import crypto from "crypto";
import Swarm from "discovery-swarm";
import defaults from "dat-swarm-defaults";
import getPort from "get-port";
import os from "os";
import { machineIdSync } from "node-machine-id";
import settings from "electron-settings";

const COPYCAT_CHANNEL = "COPYCAT_APPLICATION_06072019_1326";

const DataTypes = {
  DATA_GREETING: 1,
  DATA_TEXT: 2
};

export default class CopycatSwarm {
  constructor() {
    this.id = crypto.randomBytes(32);
    this.config = defaults({
      id: this.id
    });
    this.swarm = Swarm(/*this.config*/);
    this.totalConnections = 0;
    this.peers = {};
    this._ondata = undefined;
    this._onWhitelistUpdated = undefined;
    this._onDevicesUpdated = undefined;
    this.deviceName = `${os.userInfo().username}(${os.platform()})`;
    this.machineId = machineIdSync();
  }

  setOnDataListener(listener) {
    this._ondata = listener;
  }

  setOnWhitelistUpdatedListener(listener) {
    this._onWhitelistUpdated = listener;
  }

  setOnDevicesUpdatedListener(listener) {
    this._onDevicesUpdated = listener;
  }

  newConnection(conn, info) {
    // Connection id
    const connectionId = ++this.totalConnections;

    const peerId = info.id.toString("hex");
    console.log(`Connected #${connectionId} to peer: ${peerId}`);

    // Keep alive TCP connection with peer
    if (info.initiator) {
      try {
        conn.setKeepAlive(true, 600);
      } catch (exception) {
        console.error(exception);
      }
    }

    conn.on("data", data => {
      console.log(
        "Received Message from peer",
        peerId,
        "---->",
        data.toString()
      );
      data = JSON.parse(data);
      let { type, content } = data;
      if (type == DataTypes.DATA_GREETING) {
        let allowedDevices = settings.get("whitelist", []);

        this.peers[peerId].name = content;
        this.peers[peerId].machine = data.machine;
        if (
          data.machine &&
          allowedDevices.includes(this.peers[peerId].machine.id)
        ) {
          this.peers[peerId].disabled = false;
        }
        if (this._onDevicesUpdated) {
          this._onDevicesUpdated(this.peers[peerId]);
        }
      } else {
        if (this._ondata !== undefined) {
          this._ondata(content);
        }
      }
    });

    conn.on("close", () => {
      // Here we handle peer disconnection
      console.log(`Connection ${connectionId} closed, peer id: ${peerId}`);
      // If the closing connection is the last connection with the peer, removes the peer
      if (this.peers[peerId].connectionId === connectionId) {
        delete this.peers[peerId];
      }
      if (this._onDevicesUpdated) {
        this._onDevicesUpdated();
      }
    });

    // Save the connection
    if (!this.peers[peerId]) {
      this.peers[peerId] = {};
    }
    this.peers[peerId].conn = conn;
    this.peers[peerId].info = info;
    this.peers[peerId].connectionId = connectionId;
    this.peers[peerId].disabled = true;
    conn.write(
      JSON.stringify({
        type: DataTypes.DATA_GREETING,
        machine: {
          name: this.deviceName,
          id: this.machineId
        },
        content: this.deviceName
      })
    );
    if (this._onDevicesUpdated) {
      this._onDevicesUpdated(this.peers[peerId]);
    }
  }

  broadcast(data) {
    for (const id in this.peers) {
      if (this.peers.hasOwnProperty(id)) {
        const peer = this.peers[id];
        if (!peer.disabled) {
          peer.conn.write(
            JSON.stringify({
              type: DataTypes.DATA_TEXT,
              content: data
            })
          );
        }
      }
    }
  }

  notifyWhitelistUpdated(device) {
    if (this._onWhitelistUpdated) {
      this._onWhitelistUpdated(device);
    }
  }

  updateDevice(deviceConnectionId, updateData) {
    for (const id in this.peers) {
      if (
        this.peers.hasOwnProperty(id) &&
        this.peers[id]["connectionId"] == deviceConnectionId
      ) {
        const peer = this.peers[id];
        for (const key in updateData) {
          if (updateData.hasOwnProperty(key) && key != "id") {
            const value = updateData[key];
            peer[key] = value;
          }
        }
        if (updateData.hasOwnProperty("disabled")) {
          this.notifyWhitelistUpdated(peer);
        }
        break;
      }
    }
  }

  destroy(onClose) {
    this.swarm.destroy(onClose);
  }

  async start() {
    const port = await getPort();
    this.swarm.listen(port);
    console.log("Copycat swarm starts listenin on port:", port);
    this.swarm.join(COPYCAT_CHANNEL);
    this.swarm.on("connection", this.newConnection.bind(this));
  }
}
