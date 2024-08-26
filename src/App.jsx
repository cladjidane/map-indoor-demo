import "mapbox-gl/dist/mapbox-gl.css";

import * as React from "react";
import * as turf from "@turf/turf";

import { IndoorControl, IndoorMap, addIndoorTo } from "./map-indoor"; // dossier ts pas le compoenent
import { initScrollTrigger, prepareGeojsonArray } from "./helpers";
import { useEffect, useRef, useState } from "react";

import ArrowToGo from "./components/ArrowToGo";
import MapboxPopup from "./components/MapboxPopup";
import ReactDOMServer from "react-dom/server";
import axios from "axios";
import { filtersByDatas } from "./map-indoor/Utils";
import mapboxgl from "mapbox-gl";
import site from "./datas/site.json";
import { useWindowSize } from "usehooks-ts";

mapboxgl.accessToken =
  "pk.eyJ1IjoiamVvZnVuLTIiLCJhIjoiY2xwbWZxejg4MDlwejJqcW40M2N1bW1sdiJ9.k6oozIhLBsUdxRdbkCBKmg";

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
      console.log('FAKE', site);
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
      style: "mapbox://styles/jeofun-2/clpmftiut00y801po3xjkfvdv",
      center: data.steps[0].step_mapconfig.center, //[0.001196129190514, -0.006008249764901], // [lng, lat], //
      zoom:
        width < 700
          ? data.steps[0].step_mapconfig.zoom - 1
          : data.steps[0].step_mapconfig.zoom,
    });

    let easeTo = {
      center: data.steps[0].step_mapconfig.center,
      zoom:
        width < 700
          ? data.steps[0].step_mapconfig.zoom - 1
          : data.steps[0].step_mapconfig.zoom,
      duration: data.steps[0].step_mapconfig.duration,
      padding: {
        top: 25,
        bottom: width < 700 ? width / 2 : 25,
        left: 25, //(30 / 100) * Math.min(width, height),
        right: 25,
      },
    };
    map.current.easeTo(easeTo);

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
      zoom:
        width < 700
          ? data.steps[currentStep].step_mapconfig.zoom - 1
          : data.steps[currentStep].step_mapconfig.zoom,
      duration: data.steps[currentStep].step_mapconfig.duration,
      padding: {
        top: 25,
        bottom: width < 700 ? width / 2 : 25,
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
          className={`snap-start snap-always shadow-xl h-screen relative z-30 xs:w-full md:w-3/12 lg:w-3/12 flex flex-col xs:justify-end md:justify-center pointer-events-auto`}
        >
          <div className=" bg-white xs:h-auto xs:max-h-[50vh] xs:overflow-y md:h-screen xs:p-8 md:p-16 overflow-y-auto">
            <p className="uppercase text-gray-400 mb-4">
              {step.step_title_top}
            </p>
            <h3 className="xs:text[20px] md:text-3xl mb-4 font-[900] text-orange">
              {step.step_title}
            </h3>
            <div
              className="xs:text-sm md:text-base"
              dangerouslySetInnerHTML={{ __html: step.step_text }}
            />
            {width > 700 && (
              <>
                {data.steps.length > i + 1 ? (
                  <a href={`#sectionstep-${i + 1}`}>
                    <ArrowToGo orientation="bottom" />
                  </a>
                ) : (
                  <a
                    href={`#sectionstep-0`}
                    className="text-xs flex flex-col items-start justify-start w-auto ml-0"
                  >
                    <ArrowToGo orientation="top" />
                    retour
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      );
    });
  };
  if (!data) return;
  return (
    <div
      id="section-map"
      className="overflow-scroll snap-mandatory snap-y  scroll-smooth relative"
      ref={sectionMapRef}
    >
      <div
        ref={mapContainer}
        className="map-container md:l-1/4 h-screen top-0 md:ml-3/12 right-0 z-10 xs:w-full md:w-9/12 lg:w-9/12"
      >
        {data && (
          <div className="z-50 absolute left-12 bottom-12 drop-shadow-xl">
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
              Niveau {data.steps[currentStep].step_mapconfig.level}
            </p>
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
