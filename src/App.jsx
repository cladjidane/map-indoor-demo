import "mapbox-gl/dist/mapbox-gl.css";

import * as React from "react";
import axios from 'axios';

import * as turf from "@turf/turf";

import { useEffect, useRef, useState } from "react";
import {
  addIndoorTo,
  IndoorMap,
  IndoorControl
} from "./map-indoor"; // dossier ts pas le compoenent
import { useWindowSize } from "usehooks-ts";

import Drawer from "./components/Drawer"
import { filtersByDatas } from "./map-indoor/Utils";

import nmin1 from "./datas/n-1.json";
import nmin2 from "./datas/n-2.json";
import sols from "./datas/sols.json";
import gradins from "./datas/gradins.json";
import sieges from "./datas/sieges.json";

import mapboxgl from "mapbox-gl";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import chapters from "./chapters.json";

gsap.registerPlugin(ScrollTrigger);

mapboxgl.accessToken =
  "pk.eyJ1IjoiamVvZnVuIiwiYSI6ImNrd3huZXZjMzAwMWkycXFtb29zeDMxdnMifQ.N0SyKbZ6Br7bCL0IPmUZIg";

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { width, height } = useWindowSize();
  const mapContainer = useRef(null);
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState(null);


  const map = useRef(null);
  const [lng, setLng] = useState(-4.519816876493678);
  const [lat, setLat] = useState(48.38748232729199);
  const [zoom, setZoom] = useState(17);

  const [geojson, setGeojson] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);

  const [debug, setDebug] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/wp-json/k/v1/maps/79');
        const apiData = response.data;
        setData(apiData);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des données depuis l\'API', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!map.current ) return;
    var legendWidth = width / 8; // Largeur du tableau des légendes en pixels
    var originalCenter = [lng, lat];
    var newCenter = map.current.unproject([
      map.current.project(originalCenter).x - legendWidth,
      map.current.project(originalCenter).y,
    ]);

    map.current.setCenter(newCenter);
  }, [width]);

  useEffect(() => {
    if(data === null) return
    const el = document.getElementById("section-map");
    el.querySelectorAll(".menu-map").forEach((section, index) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        toggleClass: "active",
        scrub: 1,
        // snap: {
        //   snapTo: 0.5,
        //   duration: 0.1,
        //   delay: 0.1,
        //   ease: "power1.inOut",
        // },
        markers: true,
        onUpdate: (self) => {
          const isCurrentlyActive = self.isActive;
          //const level = section.getAttribute("data-level");

          if (isCurrentlyActive) {
            setDebug(`${index}`);
            setCurrentChapter(index);
            // console.log(section.className);
          }
        },
      });
    });

    // Parcourez chaque section pour configurer le ScrollTrigger
    // el.querySelectorAll("ul").forEach((section, index) => {
    //   gsap.to(section, {
    //     scrollTrigger: {
    //       trigger: section,
    //       start: "top center", // Quand le centre de la section atteint le haut de la fenêtre
    //       end: "bottom center", // Quand le centre de la section atteint le bas de la fenêtre
    //       toggleClass: "active", // Classe à ajouter lorsque la section est visible
    //       markers: true, // Supprimez cette ligne si vous ne voulez pas afficher les marqueurs de débogage ScrollTrigger
    //     },
    //   });
    // });

    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/jeofun/clm7b04lj00yi01que65k0llt",
      center: [lng, lat], //[0.001196129190514, -0.006008249764901], // [lng, lat], //
      zoom: zoom,
    });

    const nav = new mapboxgl.NavigationControl();
    map.current.addControl(nav, "top-right");
    map.current.scrollZoom.disable();

    map.current.on("load", function () {
      map.current.on("zoomend", function () {
        setDebug(debug + map.current.getZoom() + map.current.getCenter());
      });

      let hoveredPolygonId = null;

      map.current.on("mousemove", "indoor-rooms", (e) => {
        map.current.getCanvas().style.cursor = "pointer";
        const properties = e.features[0].properties;
        const coordinates = turf.centroid(e.features[0]).geometry.coordinates;

        if (e.features.length > 0) {
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
          if(!drawerIsOpen) setDrawerIsOpen(true);
          setDrawerContent(properties)
        }
      });

      map.current.on("mouseleave", "indoor-rooms", (e) => {
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

      if (map.current.indoor.getSelectedMap()) {
        map.current.indoor.setLevel(1);
      }
    });
    addIndoorTo(map.current);

    const geojsonArray = [];

    geojsonArray.push(sols);
    geojsonArray.push(gradins);
    geojsonArray.push(nmin2);
    geojsonArray.push(nmin1);
    geojsonArray.push(sieges);
    console.log(sieges)
    console.log(data.data)
    geojsonArray.push(data.data);

    const geojson = {
      type: "FeatureCollection",
      features: geojsonArray.reduce((allFeatures, geojsonData) => {
        return allFeatures.concat(geojsonData.features);
      }, []),
    };
    setGeojson(geojson);
    filtersByDatas(geojson);

    map.current.indoor.addMap(IndoorMap.fromGeojson(geojson));
    map.current.addControl(new IndoorControl());

  }, [data]);

  useEffect(() => {
    if (!map.current) return;
    if (!chapters[currentChapter]) return;

    const easeTo = chapters[currentChapter].easeTo;
    setDebug(`${chapters[currentChapter].level}`);
    const level = chapters[currentChapter].level;
    map.current.easeTo({
      ...easeTo,
      padding: { top: 10, bottom: 25, left: width / 3, right: 5 },
    });

    if (map.current.indoor.getSelectedMap()) {
      map.current.indoor.setLevel(level);
    }
  }, [currentChapter]);

  return (
    <div>
      <Drawer drawerIsOpen={drawerIsOpen} setDrawerIsOpen={setDrawerIsOpen} drawerContent={drawerContent}></Drawer>
      <div ref={mapContainer} className="map-container" />
      <div className="absolute left-2 top-2 w-48 bg-slate-100 p-4 z-50">
        {debug}
      </div>
    </div>
  );
};

export default App;
