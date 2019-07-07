import React from 'react';
import './AppHeader.css';
import { ReactComponent as Logo } from '../logo.svg';

class AppHeader extends React.Component {
    render() {
        return (
            <header className="app-header">
                <div className="content">
                    <div className="hamburger">
                        <Logo style={{ width:"100%", height:"100%"}}/>
                    </div>
                    <div className="title">
                        Discovered Devices
                    </div>
                </div>
            </header>
        );
    }
}

export default AppHeader;
