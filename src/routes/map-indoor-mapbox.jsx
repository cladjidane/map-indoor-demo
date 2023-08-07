import "mapbox-gl/dist/mapbox-gl.css";

import * as React from "react";
import * as turf from "@turf/turf";

import { IndoorControl, IndoorMap, addIndoorTo } from "../map-indoor/";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWindowSize } from "usehooks-ts";

import Drawer from "../components/Drawer";

import arena from "../assets/arena.test.json";
import transports from "../assets/arena-test-1-transports.json";
import schyzo from "../assets/test-points.json";
import extrude from "../assets/extrude.json";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken =
  "pk.eyJ1IjoiamVvZnVuIiwiYSI6ImNrd3huZXZjMzAwMWkycXFtb29zeDMxdnMifQ.N0SyKbZ6Br7bCL0IPmUZIg";

const MapIndoorMapbox = () => {
  const { width, height } = useWindowSize();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-4.519800633193512);
  //const [lng, setLng] = useState(2.3596569);
  const [lat, setLat] = useState(48.38794021277715);
  //const [lat, setLat] = useState(48.8765734);
  const [zoom, setZoom] = useState(17);

  useEffect(() => {
    if (!map.current) return;
    var legendWidth = width / 8; // Largeur du tableau des légendes en pixels
    var originalCenter = [lng, lat];
    // var newCenter = map.current.unproject([
    //   map.current.project(originalCenter).x - legendWidth,
    //   map.current.project(originalCenter).y,
    // ]);

    //map.current.setCenter(newCenter);
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
      map.current.addSource("transports", {
        type: "geojson",
        data: transports,
      });

      map.current.addLayer({
        id: "transports-lines", // Layer ID
        type: "line",
        source: "transports",
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-opacity": {
            base: 1,
            stops: [
              [11, 0],
              [12, 1],
              [15, 1],
              [16, 0],
            ],
          },
          "line-color": [
            "match",
            ["get", "route"],
            "tram",
            "red",
            "bus",
            "green",
            "bicycle",
            "blue",
            "black",
          ],
          "line-width": 2,
        },
      });

      map.current.addLayer({
        id: "transports-text", // Layer ID
        type: "symbol",
        source: "transports",
        layout: {
          "text-line-height": 1.2,
          "text-size": {
            base: 1,
            stops: [
              [17, 10],
              [20, 12],
            ],
          },
          "text-allow-overlap": false,
          "text-ignore-placement": false,
          "symbol-placement": "line",
          //"text-max-angle": 38,
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Regular"],
          "text-padding": 2,
          visibility: "visible",
          //"text-anchor": "center",
          "text-field": "{name}",
          "text-rotation-alignment": "auto",
          "text-letter-spacing": 0.02,
          "text-max-width": 8,
        },
        paint: {
          "text-color": "#65513d",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1,
          "text-opacity": {
            base: 1,
            stops: [
              [9, 0],
              [10, 1],
              [15, 1],
              [16, 0],
            ],
          },
        },
      });

      /**
       * EXT<rUDE
       */
      // map.current.addSource("floorplan", {
      //   type: "geojson",
      //   data: extrude,
      // });
      // map.current.addLayer({
      //   id: "room-extrusion",
      //   type: "fill-extrusion",
      //   source: "floorplan",
      //   paint: {
      //     // Get the `fill-extrusion-color` from the source `color` property.
      //     'fill-extrusion-color': [
      //       'interpolate',
      //       ['linear'],
      //       ['get', 'HEIGHT'],
      //       3, '#F2F12D',
      //       3.4, '#EED322',
      //       3.8, '#E6B71E',
      //       4.2, '#DA9C20',
      //       4.8, '#CA8323'
      //     ],

      //     // Get `fill-extrusion-height` from the source `height` property.
      //     // Hauteur de départ
      //     "fill-extrusion-base": ["get", "HEIGHT"],

      //     // Get `fill-extrusion-base` from the source `base_height` property.
      //     // Hauteur de l'extrusion à partir de la hauteur de départ
      //     "fill-extrusion-height": ["get", "EXTRUSION"],

      //     // Make extrusions slightly opaque to see through indoor walls.
      //     "fill-extrusion-opacity": 1,
      //   },
      // });

      //var pointOnPolygon = turf.pointOnFeature(polygon);

      // map.current.on("mousemove", (e) => {
      //   const features = map.current.queryRenderedFeatures(e.point);

      //   // Limit the number of properties we're displaying for
      //   // legibility and performance
      //   const displayProperties = [
      //     "type",
      //     "properties",
      //     "id",
      //     "layer",
      //     "source",
      //     "sourceLayer",
      //     "state",
      //   ];

      //   const displayFeatures = features.map((feat) => {
      //     const displayFeat = {};
      //     displayProperties.forEach((prop) => {
      //       displayFeat[prop] = feat[prop];
      //     });
      //     return displayFeat;
      //   });

      //   // Write object as string with an indent of two spaces.
      //   document.getElementById("features").innerHTML = JSON.stringify(
      //     displayFeatures,
      //     null,
      //     2
      //   );
      //   console.log(displayFeatures);
      // });
    });

    addIndoorTo(map.current);
    // Retrieve the geojson from the path and add the map
    const geojson = extrude;

    map.current.indoor.addMap(IndoorMap.fromGeojson(geojson));
    // Add the specific control
    map.current.addControl(new IndoorControl());
  }, []);

  return (
    <div>
      <Drawer></Drawer>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default MapIndoorMapbox;
