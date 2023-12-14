import React from 'react';
import './App.css';
import AppHeader from './components/AppHeader';
import DeviceList from './components/DeviceList';

class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      devices: []
    }
    this.refreshDevices = this.refreshDevices.bind(this)
  }

  componentWillMount() {
    if (window.ipcRenderer) {
      this.refreshDevices()
    }
  }

  refreshDevices() {
    console.debug(`refreshDevices:", this.state.devices`)
    this.setState({
      devices: window.ipcRenderer.sendSync("getDevices")
    })
    setTimeout(this.refreshDevices, 500);
  }


  render() {
    return (
      <div className="App">
        <AppHeader />
        <DeviceList devices={this.state.devices} />
      </div>
    );
  }

}

export default App;
