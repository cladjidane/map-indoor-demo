import "mapbox-gl/dist/mapbox-gl.css";

import * as React from "react";
import * as turf from "@turf/turf";

import { IndoorControl, IndoorMap, addIndoorTo } from "../map-indoor/";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWindowSize } from "usehooks-ts";

import Drawer from "../components/Drawer";

import arena from "../assets/arena.json";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken =
  "pk.eyJ1IjoiamVvZnVuIiwiYSI6ImNrd3huZXZjMzAwMWkycXFtb29zeDMxdnMifQ.N0SyKbZ6Br7bCL0IPmUZIg";

const Root = () => {
  const { width, height } = useWindowSize();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-4.519800633193512);
  const [lat, setLat] = useState(48.38794021277715);
  const [zoom, setZoom] = useState(17);

  useEffect(() => {
    if (!map.current) return;
    var legendWidth = width / 8; // Largeur du tableau des légendes en pixels
    var originalCenter = [lng, lat];
    var newCenter = map.current.unproject([
      map.current.project(originalCenter).x - legendWidth,
      map.current.project(originalCenter).y,
    ]);

    map.current.setCenter(newCenter);
  }, [width]);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/jeofun/clia4348h02t701pr52we3yn6",
      center: [lng, lat], //[0.001196129190514, -0.006008249764901], // [lng, lat], //
      zoom: zoom,
    });

    const nav = new mapboxgl.NavigationControl();
    map.current.addControl(nav, "top-right");

    map.current.on("load", function () {
      // map.current.addSource("transports", {
      //   type: "geojson",
      //   data: transports,
      // });

      // map.current.addLayer({
      //   id: "transports-lines", // Layer ID
      //   type: "line",
      //   source: "transports",
      //   layout: {
      //     "line-cap": "round",
      //     "line-join": "round",
      //   },
      //   paint: {
      //     "line-opacity": {
      //       base: 1,
      //       stops: [
      //         [11, 0],
      //         [12, 1],
      //         [15, 1],
      //         [16, 0],
      //       ],
      //     },
      //     "line-color": [
      //       "match",
      //       ["get", "route"],
      //       "tram",
      //       "red",
      //       "bus",
      //       "green",
      //       "bicycle",
      //       "blue",
      //       "black",
      //     ],
      //     "line-width": 2,
      //   },
      // });

      // map.current.addLayer({
      //   id: "transports-text", // Layer ID
      //   type: "symbol",
      //   source: "transports",
      //   layout: {
      //     "text-line-height": 1.2,
      //     "text-size": {
      //       base: 1,
      //       stops: [
      //         [17, 10],
      //         [20, 12],
      //       ],
      //     },
      //     "text-allow-overlap": false,
      //     "text-ignore-placement": false,
      //     "symbol-placement": "line",
      //     //"text-max-angle": 38,
      //     "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Regular"],
      //     "text-padding": 2,
      //     visibility: "visible",
      //     //"text-anchor": "center",
      //     "text-field": "{name}",
      //     "text-rotation-alignment": "auto",
      //     "text-letter-spacing": 0.02,
      //     "text-max-width": 8,
      //   },
      //   paint: {
      //     "text-color": "#65513d",
      //     "text-halo-color": "#ffffff",
      //     "text-halo-width": 1,
      //     "text-opacity": {
      //       base: 1,
      //       stops: [
      //         [9, 0],
      //         [10, 1],
      //         [15, 1],
      //         [16, 0],
      //       ],
      //     },
      //   },
      // });

      // Create a popup, but don't add it to the map yet.
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      });

      map.current.on("mouseenter", "indoor-areas", (e) => {
        if (e.features.length > 0) {

          map.current.getCanvas().style.cursor = 'pointer';

          const layerName = e.features[0].layer.id; 
          const coordinates = e.features[0].geometry.coordinates.slice();
          const description = e.features[0].properties.description;
          const polygonId = e.features[0].id;

          map.current.setPaintProperty(layerName, 'fill-color', ['match', ['id'], polygonId, 'red', 'blue']); 

        }
      });

      map.current.on("mouseleave", "room, area", () => {

      });
    });
    addIndoorTo(map.current);

    const geojson = arena;

    map.current.indoor.addMap(IndoorMap.fromGeojson(geojson));
    map.current.addControl(new IndoorControl());
  }, []);

  return (
    <div>
      <Drawer></Drawer>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default Root;
