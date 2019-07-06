import React from 'react';
import './DeviceList.css';
import DeviceListItem from './DeviceListItem';

class DeviceList extends React.Component {
    render() {
        const devices = this.props.devices;
        return (
            <div className="device-list">
                {
                    devices.map((device) => (
                        <DeviceListItem key={device.id} {...device} />
                    ))
                }
            </div>
        );
    }
}

export default DeviceList;
