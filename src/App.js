import React from 'react';
import ReactDOM from "react-dom";
import './App.css';
import HazardMap from './components/HazardMap';
import FloatingLayer from './components/FloatingLayer';
import {FloatingPin} from './components/EarthquakeGenerator';
import map_marker from './img/map_marker.png';

import awsconfig from './aws-exports';
import {API, graphqlOperation} from "aws-amplify";
import Auth from '@aws-amplify/auth';
Auth.configure(awsconfig);
API.configure(awsconfig);

class App extends React.Component {
  state = {
    earthquakeStep: 1
  }

  goto_step_two = function() {
    this.setState({earthquakeStep: 2});
    //ReactDOM.render(<FloatingPin />, document.getElementById("marker_container"));
  }
  hazardmap_onclick = function(e) {
    if (this.state.earthquakeStep === 2) {
      this.setState({earthquakeStep: 3});
    }
  }
  render() {
    return (<div className="App">
      {
        this.state.earthquakeStep === 2
          ? <FloatingPin/>
          : null
      }
      <FloatingLayer earthquakeStep={this.state.earthquakeStep} onClick={() => this.goto_step_two()}/>
      <HazardMap earthquakeStep={this.state.earthquakeStep} onClick={() => this.hazardmap_onclick()}/>
      <div id={"marker_container"}></div>
    </div>)
  }
}

export default App;
