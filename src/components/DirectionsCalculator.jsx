import React, { useState, useEffect } from "react";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import mapboxgl from "mapbox-gl";
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';


import axios from "axios";

const DirectionsCalculator = ({ map }) => {
  const [startPoint, setStartPoint] = useState("");
  const [destination, setDestination] = useState([
    -4.519893497408361, 48.38745375558625,
  ]);
  const [error, setError] = useState(null);

  const accessToken =
    "pk.eyJ1IjoiamVvZnVuIiwiYSI6ImNrd3huZXZjMzAwMWkycXFtb29zeDMxdnMifQ.N0SyKbZ6Br7bCL0IPmUZIg";

  useEffect(() => {
    const mapboxGeocoder = new MapboxGeocoder({
      accessToken: accessToken,
      mapboxgl: mapboxgl,
    });

    const geocoderContainer = document.getElementById('geocoder-container');
    if (!geocoderContainer) {
      return;
    }

    mapboxGeocoder.addTo("#geocoder-container");

    mapboxGeocoder.on("result", (event) => {
      setStartPoint([
        event.result.geometry.coordinates[1],
        event.result.geometry.coordinates[0],
      ]);
    });
  }, []);

  const generateGoogleMapsLink = (mode) => {
    const travelMode = mode; // Mode de transport en transports en commun
    const googleMapsURL = `https://www.google.com/maps/dir/?api=1&origin=${startPoint}&destination=${destination[1]},${destination[0]}&travelmode=${travelMode}`;
    window.open(googleMapsURL, "_blank");
  };

  return (
    <div>
      <div id="geocoder-container" className="mb-6"></div>

      {startPoint && (
        <div className="flex flex-col gap-6 items-start">
          <button
            className="bg-orange text-white px-6 py-2 rounded-lg"
            type="button"
            onClick={() => generateGoogleMapsLink("driving")}
          >
            Voiture
          </button>
          <button
            className="bg-orange text-white px-6 py-2 rounded-lg"
            type="button"
            onClick={() => generateGoogleMapsLink("transit")}
          >
            Tram / bus
          </button>
          <button
            className="bg-orange text-white px-6 py-2 rounded-lg"
            type="button"
            onClick={() => generateGoogleMapsLink("BICYCLING")}
          >
            Vélo
          </button>
          <button
            className="bg-orange text-white px-6 py-2 rounded-lg"
            type="button"
            onClick={() => generateGoogleMapsLink("WALKING")}
          >
            A pied
          </button>
        </div>
      )}
      {/* {routeInstructions.length > 0 && renderInstructions()} */}
      {error && <p>Une erreur s'est produite. Veuillez réessayer.</p>}
    </div>
  );
};

export default DirectionsCalculator;
