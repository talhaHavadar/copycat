import React from 'react';
import './DeviceListItem.css';
import { ReactComponent as Logo } from '../logo.svg';

class DeviceListItem extends React.Component {
    render() {
        const {id, name, ip_addr, disabled} = this.props;
        return (
            <li className="device-list-item gradient-border">
                <div className={disabled ? "status disabled": "status"} onClick={this.toggleDeviceDisabledState.bind(this, id, disabled)}>
                    <Logo style={{ width:"100%", height:"100%"}}/>
                </div>
                <div className="name">{name}</div>
                <div className="separator" />
                <div className="ip">{ip_addr}</div>
            </li>
        );
    }

    toggleDeviceDisabledState(deviceId, currentState, e) {
        if (window.ipcRenderer) {
            console.log(deviceId, currentState, e)
            console.log("ipcRenderer updateDevice:", window.ipcRenderer.send("updateDevice", {id: deviceId,  disabled: !currentState }))
        }
    }

}

export default DeviceListItem;
