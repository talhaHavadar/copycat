import React from 'react';
import './AppHeader.css';

class AppHeader extends React.Component {
    render() {
        return (
            <header className="app-header">
                <div className="content">
                    <div className="hamburger">
                        |||
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
