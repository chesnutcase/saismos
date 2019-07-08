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
    this.mapSeries = polygonSeries;
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
    polygonTemplate.tooltipText = "LAT: {capital_lat} \n LONG: {capital_long} \n {Propinsi} \n Deaths: {deaths} \n Casaulties: {casualties}";
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
  sendRequest() {
    function calcCrow(lat1, lon1, lat2, lon2) {
      var R = 6371; // km
      var dLat = toRad(lat2 - lat1);
      var dLon = toRad(lon2 - lon1);
      var lat1 = toRad(lat1);
      var lat2 = toRad(lat2);

      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;
      return d;
    }

    // Converts numeric degrees to radians
    function toRad(Value) {
      return Value * Math.PI / 180;
    }

    for (let i = 0; i < this.mapSeries.data.length; i++) {
      let data = this.mapSeries.data[i];
      let citylat = data.capital_lat;
      let citylng = data.capital_long;
      let quakelat = this.state.lastClick.latitude;
      let quakeLong = this.state.lastClick.longitude;
      let distance = calcCrow(citylat, citylng, quakelat, quakeLong);
      let mag = this.props.earthquakeMag;
      let depth = this.props.earthquakeDepth;

      let xhr = new XMLHttpRequest();
      xhr.open("POST", "http://ec2-3-0-145-111.ap-southeast-1.compute.amazonaws.com/");
      let fd = new FormData();
      fd.append("distance", distance);
      fd.append("mag", mag);
      fd.append("depth", depth);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 || xhr.status == 200) {
          let responseData = JSON.parse(xhr.responseText);
          data.deaths = responseData.deaths;
          data.casualties = responseData.casualties;
        }
      }
      xhr.send(fd);
    }
    alert("simulation complete!");
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