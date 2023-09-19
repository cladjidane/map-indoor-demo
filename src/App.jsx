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

import { prepareGeojsonArray, initScrollTrigger } from "./helpers";

mapboxgl.accessToken =
  "pk.eyJ1IjoiamVvZnVuIiwiYSI6ImNrd3huZXZjMzAwMWkycXFtb29zeDMxdnMifQ.N0SyKbZ6Br7bCL0IPmUZIg";

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const popup = useRef(null);
  const [featureId, setFeatureId] = useState(null);

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
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://brest-arena.51-83-37-25.plesk.page/wp-json/k/v1/maps/map/4618"
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

  useEffect(() => {
    if (!data || !map.current) return;

    data.allFeatures.forEach((feature) => {
      map.current.setFeatureState(
        {
          source: "indoor",
          id: feature.id,
        },
        { hover: false }
      );
    });

    if (featuresHovered) {
      featuresHovered.forEach((featureId) => {
        map.current.setFeatureState(
          {
            source: "indoor",
            id: featureId,
          },
          { hover: true }
        );
      });
    }

    const feature = data.allFeatures.find((el) => el.id === featuresHovered[0]);
    const coordinates = turf.centroid(feature).geometry.coordinates;
    if (map.current.indoor.getSelectedMap()) {
      map.current.indoor.setLevel(parseInt(feature.properties.level));
    }
    if (popup.current) popup.current.remove();

    const popupContent = ReactDOMServer.renderToString(
      <MapboxPopup properties={feature.properties} />
    );

    popup.current = new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(popupContent)
      .addTo(map.current);
  }, [data, featuresHovered]);

  useEffect(() => {
    if (data === null) return;
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/jeofun/clm7b04lj00yi01que65k0llt",
      center: data.steps[0].step_mapconfig.center, //[0.001196129190514, -0.006008249764901], // [lng, lat], //
      zoom: data.steps[0].step_mapconfig.zoom,
    });

    const nav = new mapboxgl.NavigationControl();
    map.current.addControl(nav, "bottom-right");
    map.current.scrollZoom.disable();

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

      map.current.on("click", function (e) {
        const zoomLevel = map.current.getZoom();
        const coordinates = e.lngLat.toArray();

        setDebug(
          `${JSON.stringify(zoomLevel)} -- ${JSON.stringify(coordinates)}`
        );
      });
    });

    map.current.on("indoor.map.loaded", () => {
      if (map.current.indoor.getSelectedMap()) {
        const level = data.steps[0].step_mapconfig.level;
        map.current.indoor.setLevel(level);
      }
    });

    let geojson = prepareGeojsonArray(data);
    addIndoorTo(map.current);
    setGeojson(geojson);
    filtersByDatas(geojson);

    map.current.indoor.addMap(IndoorMap.fromGeojson(geojson));
    map.current.addControl(new IndoorControl(), "bottom-right");

    // ScrollTrigger
    initScrollTrigger(
      mapContainer,
      sectionMapRef,
      elementsRefs,
      setCurrentStep
    );
  }, [data]);

  useEffect(() => {
    if (!map.current) return;
    if (!data.steps[currentStep]) return;
    if (popup.current) {
      popup.current.remove();
    }
    const level = data.steps[currentStep].step_mapconfig.level;
    let easeTo = {
      center: data.steps[currentStep].step_mapconfig.center,
      zoom: data.steps[currentStep].step_mapconfig.zoom,
      duration: data.steps[currentStep].step_mapconfig.duration,
      padding: {
        top: 25,
        bottom: 25,
        left: 25, //(30 / 100) * Math.min(width, height),
        right: 25,
      },
    };
    map.current.easeTo(easeTo);

    if (map.current.indoor.getSelectedMap()) {
      map.current.indoor.setLevel(level);
    }
  }, [currentStep]);

  const renderStep = () => {
    return data.steps.map((step, i) => {
      return (
        <div
          key={`sectionstep-${i}`}
          id={`sectionstep-${i}`}
          ref={(element) => {
            elementsRefs.current[i] = element;
          }}
          className={`shadow-xl h-screen relative z-30 pointer-events-none bg-white xs:w-full md:w-3/12 lg:w-3/12 flex flex-col justify-center p-16 pointer-events-auto`}
        >
          <p className="uppercase text-gray-400 mb-4">{step.step_title_top}</p>
          <h3 className="text-3xl mb-4 font-[900] text-orange">
            {step.step_title}
          </h3>
          <div dangerouslySetInnerHTML={{ __html: step.step_text }} />

          { data.steps.length < i && 
            <div className="w-8 h-8 mt-8">
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  data-name="Calque 2"
                  viewBox="0 0 14.89 14.89"
                >
                  <g data-name="Calque 1">
                    <circle
                      cx={7.44}
                      cy={7.44}
                      r={7.44}
                      style={{
                        fill: "#e94f1b",
                      }}
                    />
                    <path
                      d="M8.15 7.96c-.15 0-.3.02-.45.02.02-.45.05-.9.08-1.35.06-.91.21-1.93-.17-2.78-.09-.2-.37-.24-.54-.14-.2.11-.23.35-.14.54.16.37.13.8.12 1.19-.01.47-.04.94-.07 1.41l-.06 1.07c-.17-.04-.34-.09-.48-.18-.2-.12-.38-.04-.49.1-.16.1-.26.31-.14.52l1.53 2.67c.2.35.72.18.74-.2.04-.81.2-1.6.46-2.38.08-.23-.13-.52-.38-.5Z"
                      style={{
                        fill: "white",
                      }}
                    />
                  </g>
                </svg>
            </div>
          }
        </div>
      );
    });
  };
  if (!data) return;
  return (
    <div id="section-map" className="relative" ref={sectionMapRef}>
      <div
        ref={mapContainer}
        className="map-container h-screen top-0 ml-3/12 right-0 z-10 xs:w-full md:w-9/12 lg:w-9/12"
      >
        {data && (
          <div className="z-50 absolute left-12 bottom-12 drop-shadow-xl">
            <p className="drop-shadow-xl uppercase text-[30px] mb-2 text-orange font-[900]">
              Niveau {data.steps[currentStep].step_mapconfig.level}
            </p>
            <div className="flex gap-2 items-center">
              <div className="bg-orange opacity-50 w-3 h-3 border border-solid border-black"></div>Exporez la carte
            </div>
          </div>
        )}
      </div>
      {data && renderStep()}
      {/* <div className="absolute left-2 top-2 w-48 bg-slate-100 p-4 z-50">
        {debug}
      </div> */}
    </div>
  );
};

export default App;
