import React from 'react';
import './DeviceListItem.css';
import { ReactComponent as Logo } from '../logo.svg';

class DeviceListItem extends React.Component {
    render() {
        const {name, ip_addr} = this.props;
        return (
            <li className="device-list-item gradient-border">
                <div className="status">
                    <Logo style={{ width:"100%", height:"100%"}}/>
                </div>
                <div className="name">{name}</div>
                <div className="separator" />
                <div className="ip">{ip_addr}</div>
            </li>
        );
    }
}

export default DeviceListItem;
