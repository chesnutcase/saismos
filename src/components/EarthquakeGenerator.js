import React from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4maps from "@amcharts/amcharts4/maps";

import map_marker from '../img/map_marker.png';

export class FloatingPin extends React.Component {
  componentDidMount() {
    console.log("mounting");
    document.body.addEventListener('mousemove', this.moveHandler);
  }
  componentWillUnmount() {
    console.log("unmounting");
    document.body.removeEventListener('mousemove', this.moveHandler);
  }
  moveHandler(e) {
    let s = document.getElementById("map_marker");
    s.style.left = (e.clientX - s.clientWidth / 2) + 'px';
    s.style.top = (e.clientY - s.clientHeight) + 'px';
  }
  render() {
    let style = {
      position: "absolute",
      zIndex: "3",
      pointerEvents: "none"
    };
    return (<img src={map_marker} style={style} width={64} size={64} id="map_marker"/>)
  }
}

class EarthquakeGenerator extends React.Component {

  constructor(props) {
    super(props);
  }
  containerStyle = {
    position: "fixed",
    width: "50vw",
    height: "5vh",
    backgroundColor: "rgba(255,255,255,0.8)",
    border: "2px solid black",
    bottom: "0px",
    left: "25vw",
    zIndex: "2",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around"
  }

  step_one_dom = () => (<div style={this.containerStyle}>
    <b>Earthquake simulator</b>
    <span>Magnitude:
      <input size={5} id={"magInput"}/></span>
    <span>Depth (km):
      <input size={5} id={"depthInput"}/></span>
    <button onClick={() => this.props.onClick()}>Place marker</button>
  </div>)

  step_two_dom = () => (<div style={this.containerStyle}>
    <b>Place marker on map to continue</b>
  </div>)

  step_three_dom = () => {
    document.getElementById("marker_container").innerHTML = "";
    return (<div style={this.containerStyle}>
      <b>Running simulations...</b>
    </div>)
  }

  render() {
    console.log("earthquakeprompt rendered");
    if (this.props.step === 1) {
      return this.step_one_dom();
    } else if (this.props.step === 2) {
      return this.step_two_dom();
    } else if (this.props.step === 3) {
      return this.step_three_dom();
    }
  }
}

export default EarthquakeGenerator;