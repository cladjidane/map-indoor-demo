import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

import React, { useEffect, useState } from "react";

import IcPied from "./IcPied";
import IcTc from "./IcTc";
import IcVelo from "./IcVelo";
import IcVoiture from "./IcVoiture";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { calculateDistance } from "../helpers";
import mapboxgl from "mapbox-gl";

const DirectionsCalculator = () => {
  const [startPoint, setStartPoint] = useState("");
  const rayonLimiteEnKm = 300; // Par exemple, un rayon de 5 km

  const [destination, setDestination] = useState([
    -4.519893497408361, 48.38745375558625,
  ]);
  const [error, setError] = useState(null);

  const accessToken =
    "pk.eyJ1IjoiamVvZnVuLTIiLCJhIjoiY2xwamV1bGI4MDltNjJsbGVxbW9rbDZseCJ9.OTLNnBuJLfOG6rh8jdRxrA";

  useEffect(() => {
    const mapboxGeocoder = new MapboxGeocoder({
      accessToken: accessToken,
      mapboxgl: mapboxgl,
      countries: "FR",
    });

    const geocoderContainer = document.getElementById("geocoder-container");
    if (!geocoderContainer) {
      return;
    }

    mapboxGeocoder.addTo("#geocoder-container");
    mapboxGeocoder.setPlaceholder("Vous partez d'où ?");

    mapboxGeocoder.on("result", (event) => {
      setError(null)
      setStartPoint([
        event.result.geometry.coordinates[1],
        event.result.geometry.coordinates[0],
      ]);
    });
  }, []);

  const generateGoogleMapsLink = (mode) => {
    if(!startPoint) setError('Veuillez préciser votre lieu de départ')
    else {
      setError(null)
      const travelMode = mode; // Mode de transport en transports en commun
      const googleMapsURL = `https://www.google.com/maps/dir/?api=1&origin=${startPoint}&destination=${destination[1]},${destination[0]}&travelmode=${travelMode}`;
      window.open(googleMapsURL, "_blank");
    }
  };

  return (
    <div>
      <p className="mb-2 font-bold">Calculez votre itinéraire :</p>
      <div id="geocoder-container" className="mb-6"></div>

        <>
          <p className="mb-2 font-bold">
            Vous souhaitez venir{" "}
            <span className="w-3 m-auto inline-block">
              <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill="rgb(232, 78, 14)"
                  d="M12.1.6a.944.944 0 0 0 .2 1.04l1.352 1.353L10.28 6.37a.956.956 0 0 0 1.35 1.35l3.382-3.38 1.352 1.352a.944.944 0 0 0 1.04.2.958.958 0 0 0 .596-.875V.96a.964.964 0 0 0-.96-.96h-4.057a.958.958 0 0 0-.883.6z"
                />
                <path
                  fill="rgb(232, 78, 14)"
                  d="M14 11v5a2.006 2.006 0 0 1-2 2H2a2.006 2.006 0 0 1-2-2V6a2.006 2.006 0 0 1 2-2h5a1 1 0 0 1 0 2H2v10h10v-5a1 1 0 0 1 2 0z"
                />
              </svg>
            </span>{" "}
            :
          </p>

          <div className="text-red-500 font-bold my-2">{error && <p>{error}</p>}</div>
          <div className="grid grid-cols-2 gap-4">
            <button
              className="bg-orange text-white px-4 py-4 rounded-lg"
              type="button"
              onClick={() => generateGoogleMapsLink("driving")}
            >
              <div className="w-12 m-auto">
                <IcVoiture className="fill-white" />
              </div>
              En voiture
            </button>
            <button
              className="bg-orange text-white px-4 py-4 rounded-lg"
              type="button"
              onClick={() => generateGoogleMapsLink("transit")}
            >
              <div className="w-12 m-auto">
                <IcTc className="fill-white" />
              </div>
              En tram/bus
            </button>
            <button
              className="bg-orange text-white px-4 py-4 rounded-lg"
              type="button"
              onClick={() => generateGoogleMapsLink("BICYCLING")}
            >
              <div className="w-12 m-auto">
                <IcVelo className="fill-white" />
              </div>
              À vélo
            </button>
            <button
              className="bg-orange text-white px-4 py-4 rounded-lg"
              type="button"
              onClick={() => generateGoogleMapsLink("WALKING")}
            >
              <div className="w-12 m-auto">
                <IcPied className="fill-white" />
              </div>
              À pied
            </button>
          </div>
        </>

      {/* {routeInstructions.length > 0 && renderInstructions()} */}
    </div>
  );
};

export default DirectionsCalculator;
