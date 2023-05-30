import * as React from "react";
import { useEffect, useState, useMemo, useCallback } from "react";
import arena from "../assets/arena.test.json";

import Map, { Source, Layer, Popup, useControl } from "react-map-gl";
import { addIndoorTo, IndoorControl, IndoorMap } from "map-gl-indoor";

import "mapbox-gl/dist/mapbox-gl.css";
// import {
//   clusterCountLayer,
//   clusterLayer,
//   unclusteredPointLayer,
//   unclusteredPointLayerText
// } from "./mapstyles";
// import MapControls from "./MapControls";

const MapIndoor = () => {
  const mapRef = React.useRef();
  const map = mapRef.current;

  function IndoorControl() {
    useControl(() => new IndoorControl(), {
      position: "top-left",
    });

    return null;
  }

  const onMapLoad = React.useCallback(async () => {
    addIndoorTo(mapRef.current.getMap());

    // Retrieve the geojson from the path and add the map
    const geojson = arena;
    const indoorMap = IndoorMap.fromGeojson(geojson);
    mapRef.current.getMap().indoor.addMap(indoorMap);
  }, []);

  return (
    <section className="relative w-full h-96">
      <Map
        ref={mapRef}
        onLoad={onMapLoad}
        initialViewState={{
          longitude: -4.519800633193512,
          latitude: 48.38794021277715,
          zoom: 15,
          renderWorldCopies: false,
        }}
        style={{ width: "100%", height: "80vh" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={
          "pk.eyJ1IjoiamVvZnVuIiwiYSI6ImNrd3huZXZjMzAwMWkycXFtb29zeDMxdnMifQ.N0SyKbZ6Br7bCL0IPmUZIg"
        }
        // interactiveLayerIds={[unclusteredPointLayer.id]}
        // cursor={cursor}
        // //projection="globe"
        // onClick={onHover}
        // scrollZoom={false}
        // //onMouseMove={onHover}
        // onMouseEnter={onMouseEnter}
        // onMouseLeave={onMouseLeave}
      >
        <IndoorControl />
      </Map>
    </section>
  );
};

export default MapIndoor;
