import React from "react"
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import map_marker from "../img/map_marker.png";
import Auth from '@aws-amplify/auth';
import {Signer} from '@aws-amplify/core';
import axios from "axios";

am4core.useTheme(am4themes_animated);

class HazardMap extends React.Component {
  componentDidMount() {
    let map = am4core.create("chartdiv", am4maps.MapChart);
    map.geodataSource.url = `${process.env.PUBLIC_URL}/map_data/indo.json`;
    // draw map boundaries
    map.projection = new am4maps.projections.Miller();
    let polygonSeries = new am4maps.MapPolygonSeries();
    polygonSeries.useGeodata = true;
    map.series.push(polygonSeries);
    // center map
    map.homeZoomLevel = 9.25;
    map.minZoomLevel = map.homeZoomLevel;
    map.maxPanOut = 0.2;
    map.homeGeoPoint = {
      longitude: 120,
      latitude: -4
    }
    // colour map
    let polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.tooltipText = "{Propinsi}";
    polygonTemplate.fill = am4core.color("#6666ff");
    let hs = polygonTemplate.states.create("hover");
    hs.properties.fill = am4core.color("#1a1aff");
    // draw grid
    let grid = map.series.push(new am4maps.GraticuleSeries());
    grid.toBack();
    grid.mapLines.template.line.stroke = am4core.color("#fff");
    grid.mapLines.template.line.strokeOpacity = 0.5;
    grid.longitudeStep = 4;
    grid.latitudeStep = 4;
    grid.fitExtent = false;
    // set mouseup listener
    map.seriesContainer.events.on("hit", (ev) => {
      this.setState({
        lastClick: map.svgPointToGeo(ev.svgPoint)
      });
      this.props.onClick();
    });
    // make public
    this.chart = map;
    window.map = map;
  }
  componentDidUpdate(oldProps) {
    if (this.props.earthquakeStep === 3) {
      {
        let imageSeries = this.chart.series.push(new am4maps.MapImageSeries());
        let imageSeriesTemplate = imageSeries.mapImages.template;
        let marker = imageSeriesTemplate.createChild(am4core.Image);
        marker.href = map_marker;
        marker.width = 64;
        marker.height = 64;
        marker.nonScaling = true;
        marker.tooltipText = "{title}";
        marker.horizontalCenter = "middle";
        marker.verticalCenter = "bottom";
        // Set property fields
        imageSeriesTemplate.propertyFields.latitude = "latitude";
        imageSeriesTemplate.propertyFields.longitude = "longitude";

        // Add data for the three cities
        imageSeries.data = [this.state.lastClick];
        imageSeries.data[0].id = "earthquake";
      }
      // Draw earthquake circles
      let imageSeries = this.chart.series.push(new am4maps.MapImageSeries());
      let imageSeriesTemplate = imageSeries.mapImages.template;
      imageSeriesTemplate.propertyFields.latitude = "latitude";
      imageSeriesTemplate.propertyFields.longitude = "longitude";
      let circle = imageSeriesTemplate.createChild(am4core.Circle);
      circle.radius = "radius";
      circle.fill = am4core.color("#FFFFFF");
      circle.fillOpacity = "opacity";
      circle.stroke = am4core.color("#FFFFFF");
      circle.strokeWidth = 2;
      circle.nonScaling = true;
      imageSeries.data = []
      for (let i = 0; i < 5; i++) {
        imageSeries.data.push({
          "latitude": this.state.lastClick.latitude,
          "longitude": this.state.lastClick.longitude,
          "radius": 4 * (i + 1),
          "opacity": 0.1 * (i + 1),
          "id": `circle_${i}`
        });
      }
      this.sendRequest();
    }
  }
  async sendRequest() {
    const guestCredentials = Auth.currentCredentials();
    const access_info = {
        secret_key: guestCredentials.secretAccessKey,
        access_key: guestCredentials.accessKeyId,
        session_token: guestCredentials.sessionToken,
    };

    const service_info = {
        region: 'ap-southeast-1',
        service: 'lambda',
    };

    const region = service_info.region;
    const functionName = "predict_earthquake-dev";

    const request = {
        url: `https://lambda.${region}.amazonaws.com/2015-03-31/functions/${functionName}/invocations`
    };

    const signedRequest = Signer.sign(request, access_info, service_info);

    const result = await axios({
        method: 'post',
        ...signedRequest
    });
    console.log("hello");
  }
  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  render() {
    console.log("rendering map");
    let height = window.innerHeight;
    let style = {
      width: "100%",
      height: height
    }
    return (<div id="chartdiv" style={style}></div>);
  }
}

export default HazardMap;