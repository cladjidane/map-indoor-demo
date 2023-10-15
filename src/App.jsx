import "mapbox-gl/dist/mapbox-gl.css";
import ReactDOMServer from "react-dom/server";

import * as React from "react";
import axios from "axios";

import * as turf from "@turf/turf";

import { useEffect, useRef, useState } from "react";
import { addIndoorTo, IndoorMap, IndoorControl } from "./map-indoor"; // dossier ts pas le compoenent
import { useWindowSize } from "usehooks-ts";

import { filtersByDatas } from "./map-indoor/Utils";
import site from "./datas/site.json";

import mapboxgl from "mapbox-gl";
import MapboxPopup from "./components/MapboxPopup";
import DirectionsCalculator from "./components/DirectionsCalculator";

import { prepareGeojsonArray } from "./helpers";

mapboxgl.accessToken =
  "pk.eyJ1IjoiamVvZnVuIiwiYSI6ImNrd3huZXZjMzAwMWkycXFtb29zeDMxdnMifQ.N0SyKbZ6Br7bCL0IPmUZIg";

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const popup = useRef(null);
  const [level, setLevel] = useState(1);

  const { width, height } = useWindowSize();
  const mapContainer = useRef(null);
  const elementsRefs = useRef([]); // enfant du parent
  const sectionMapRef = useRef(null); // parent

  const map = useRef(null);
  const [lng, setLng] = useState(-4.519889705059086);
  const [lat, setLat] = useState(48.38735432101723);

  const [geojson, setGeojson] = useState(null);
  const [featuresHovered, setFeaturesHovered] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [debug, setDebug] = useState(0);

  useEffect(() => {
    const rootElement = document.getElementById("ba-map");
    const classeString = Array.from(rootElement.classList).join(" ");
    const match = classeString.match(/map-(\w+)/);
    const mapid = match[1] || 5095;

    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://brestarena.fr/wp-json/k/v1/maps/map/" +
            mapid
        );
        const apiData = response.data;
        setData(apiData);
        setLoading(false);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données depuis l'API",
          error
        );
      }
    };

    if (process.env.NODE_ENV === "production") {
      fetchData();
    } else {
      setData(site);
      //fetchData();
    }
  }, []);

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

  // useEffect(() => {
  //   if (!data || !map.current) return;

  //   data.allFeatures.forEach((feature) => {
  //     map.current.setFeatureState(
  //       {
  //         source: "indoor",
  //         id: feature.id,
  //       },
  //       { hover: false }
  //     );
  //   });

  //   if (featuresHovered) {
  //     featuresHovered.forEach((featureId) => {
  //       map.current.setFeatureState(
  //         {
  //           source: "indoor",
  //           id: featureId,
  //         },
  //         { hover: true }
  //       );
  //     });
  //   }

  //   const feature = data.allFeatures.find((el) => el.id === featuresHovered[0]);
  //   const coordinates = turf.centroid(feature).geometry.coordinates;
  //   if (map.current.indoor.getSelectedMap()) {
  //     map.current.indoor.setLevel(parseInt(feature.properties.level));
  //   }
  //   if (popup.current) popup.current.remove();

  //   const popupContent = ReactDOMServer.renderToString(
  //     <MapboxPopup properties={feature.properties} />
  //   );

  //   popup.current = new mapboxgl.Popup()
  //     .setLngLat(coordinates)
  //     .setHTML(popupContent)
  //     .addTo(map.current);
  // }, [data, featuresHovered]);

  useEffect(() => {
    if (data === null) return;
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/jeofun/clm7b04lj00yi01que65k0llt",
      center: data.steps[0].step_mapconfig.center, //[0.001196129190514, -0.006008249764901], // [lng, lat], //
      zoom: data.steps[0].step_mapconfig.zoom,
      //dragPan: false,
    });

    const nav = new mapboxgl.NavigationControl();
    map.current.addControl(nav, "bottom-right");
    //map.current.scrollZoom.disable();

    map.current.on("load", function () {
      let hoveredPolygonId = null;

      map.current.on("click", "indoor-rooms-hover", (e) => {
        const properties = e.features[0].properties;
        const coordinates = turf.centroid(e.features[0]).geometry.coordinates;

        if (popup.current) {
          popup.current.remove();
        }

        const popupContent = ReactDOMServer.renderToString(
          <MapboxPopup properties={properties} />
        );

        popup.current = new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(popupContent)
          .addTo(map.current);
      });

      map.current.on("mousemove", "indoor-rooms-hover", (e) => {
        map.current.getCanvas().style.cursor = "pointer";

        if (e.features.length > 0) {
          if (e.features[0].properties.isDisabled) return;
          if (hoveredPolygonId !== null) {
            map.current.setFeatureState(
              {
                source: "indoor",
                id: hoveredPolygonId,
              },
              { hover: false }
            );
          }
          hoveredPolygonId = e.features[0].id;
          map.current.setFeatureState(
            {
              source: "indoor",
              id: hoveredPolygonId,
            },
            { hover: true }
          );
        }
      });

      map.current.on("mouseleave", "indoor-rooms-hover", (e) => {
        map.current.getCanvas().style.cursor = "";
        if (hoveredPolygonId !== null) {
          map.current.setFeatureState(
            {
              source: "indoor",
              id: hoveredPolygonId,
            },
            { hover: false }
          );
        }
        hoveredPolygonId = null;
      });
    });

    map.current.on("indoor.map.loaded", () => {
      if (map.current.indoor.getSelectedMap()) {
        const level = data.steps[0].step_mapconfig.level;
        map.current.indoor.setLevel(level);
      }
    });

    map.current.on("indoor.level.changed", () => {
      if (map.current.indoor.getSelectedMap()) {
        setLevel(map.current.indoor.getLevel());
      }
    });

    let geojson = prepareGeojsonArray(data);
    addIndoorTo(map.current);
    setGeojson(geojson);
    filtersByDatas(geojson);

    map.current.indoor.addMap(IndoorMap.fromGeojson(geojson));
    map.current.addControl(new IndoorControl(), "bottom-right");
  }, [data]);

  if (!data) return;
  return (
    <div id="section-map" className="h-full relative" ref={sectionMapRef}>
      <div className="relative z-50 md:h-full xs:w-full md:w-3/12 flex flex-col xs:p-8 xs:pl-8 md:pl-16 justify-center bg-white mapmask">
        <p className="uppercase text-gray-400 mb-2">PRÉPAREZ</p>
        <h3 className="text-3xl mb-4 font-[900] text-orange">VOTRE VENUE</h3>
        {map.current && <DirectionsCalculator map={map.current} />}
      </div>
      <div
        ref={mapContainer}
        className="map-container xs:relative md:absolute min-h-[600px] h-full top-0 right-0 z-10 xs:w-full md:w-9/12"
      >
        {data && (
          <div className="z-50 absolute right-12 top-12 drop-shadow-xl">
            <div className="flex gap-2 items-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                id="_\xCE\xD3\xC8_1"
                data-name="\u2014\xCE\xD3\xC8_1"
                viewBox="0 0 421.34 595.62"
                className="w-4"
              >
                <defs>
                  <style>{".cls-1{stroke-width:0}"}</style>
                </defs>
                <path
                  d="m418.67 380.38-297.2-279.47c-5.39-5.07-14.23-1.27-14.26 6.13l-1.81 407.97c-.03 6.94 7.86 10.97 13.46 6.87l89.08-65.19 57.53 133.81c1.85 4.29 6.82 6.28 11.12 4.43l82.46-35.45c4.29-1.85 6.28-6.82 4.43-11.12l-57.53-133.81 108.44-19.67c6.84-1.24 9.35-9.73 4.29-14.49Zm-121.73 9.79-27.12 5.15 63.37 147.4-50.97 21.92-63.43-147.52-86.95 63.3 1.96-331.21 241.72 226.44-78.58 14.53ZM76.51.79l-.18.07c-6.3 2.38-9.49 9.44-7.11 15.74l12.85 34.02c2.38 6.3 9.44 9.49 15.74 7.11l.18-.07c6.3-2.38 9.49-9.44 7.11-15.74L92.25 7.9C89.87 1.6 82.81-1.59 76.51.79ZM228.75 83.45l-34.09 12.88c-6.3 2.38-9.49 9.44-7.11 15.74l.07.18c2.38 6.3 9.44 9.49 15.74 7.11l34.09-12.88c6.3-2.38 9.49-9.44 7.11-15.74l-.07-.18c-2.38-6.3-9.44-9.49-15.74-7.11ZM186.62 21.17c1.34-2.97 1.45-6.29.3-9.34a12.093 12.093 0 0 0-6.4-6.81l-.18-.08a12.106 12.106 0 0 0-9.34-.29 12.093 12.093 0 0 0-6.81 6.4L147.55 47.9a12.106 12.106 0 0 0-.29 9.34c1.15 3.05 3.42 5.47 6.4 6.81l.18.08c2.97 1.34 6.29 1.45 9.34.29 3.05-1.15 5.47-3.42 6.81-6.4l16.64-36.85ZM50.86 150.65l-34.59 13.06c-6.3 2.38-9.49 9.44-7.11 15.74l.07.18c2.38 6.3 9.44 9.49 15.74 7.11l34.59-13.06c6.3-2.38 9.49-9.44 7.11-15.74l-.07-.18c-2.38-6.3-9.44-9.49-15.74-7.11ZM17.32 66.51a12.106 12.106 0 0 0-9.34-.29 12.093 12.093 0 0 0-6.81 6.4l-.08.18a12.15 12.15 0 0 0-.29 9.34c1.15 3.05 3.42 5.47 6.39 6.81l36.86 16.65c2.97 1.34 6.29 1.45 9.34.29 3.05-1.15 5.47-3.42 6.81-6.4l.08-.17a12.15 12.15 0 0 0 .29-9.34 12.158 12.158 0 0 0-6.39-6.82L17.32 66.51Z"
                  className="cls-1"
                />
              </svg>
              Exporez la carte
            </div>
            <p className="drop-shadow uppercase text-[30px] mb-2 text-orange font-[900]">
              Niveau {level}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
