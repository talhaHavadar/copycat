import React from 'react';
import './DeviceListItem.css';

class DeviceListItem extends React.Component {
    render() {
        const {name, ip_addr} = this.props;
        return (
            <li className="device-list-item gradient-border">
                <div className="status">O</div>
                <div className="name">{name}</div>
                <div className="separator" />
                <div className="ip">{ip_addr}</div>
            </li>
        );
    }
}

export default DeviceListItem;
