import React from "react"
import EarthquakeGenerator from "./EarthquakeGenerator"

class FloatingLayer extends React.Component {

  render() {
    return (<div>
      <EarthquakeGenerator step={this.props.earthquakeStep} onClick={() => this.props.onClick()}/>
    </div>)
  }
}

export default FloatingLayer;