import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import nmin2 from "./datas/nmin2.json";
import nmin1 from "./datas/nmin1.json";
import n0 from "./datas/n0.json";
import n1 from "./datas/n1.json";
// import nmin1 from "./datas/n-1.json";
// import nmin2 from "./datas/n-2.json";
// import sols from "./datas/sols.json";
// import rooms from "./datas/rooms.json";
import gradins from "./datas/gradins.json";
import sieges from "./datas/sieges.json";

export const prepareGeojsonArray = (site) => {
  const geojsonArray = [];

  geojsonArray.push(nmin2);
  geojsonArray.push(nmin1);
  geojsonArray.push(n0);
  geojsonArray.push(n1);
  // //geojsonArray.push(nmin1);
  // //geojsonArray.push(n1);
  // geojsonArray.push(n0);
  // geojsonArray.push(rooms.data);
  geojsonArray.push(gradins);
  geojsonArray.push(sieges);

  // const staticFeatures = site.allFeatures.map((feature) => ({
  //   ...feature,
  //   properties: {
  //     ...feature.properties,
  //     indoor: "room",
  //   },
  // }));

  // geojsonArray.push({
  //   type: "FeatureCollection",
  //   name: "site",
  //   features: staticFeatures,
  // });

  geojsonArray.push({
    type: "FeatureCollection",
    name: "site",
    features: site.allFeatures,
  });

  console.log(site)

  let geojson = {
    type: "FeatureCollection",
    features: geojsonArray.reduce((allFeatures, geojsonData) => {
      return allFeatures.concat(geojsonData.features);
    }, []),
  };

  return geojson;
};

export function calculateDistance(coord1, coord2) {
  const earthRadiusKm = 6371; // Rayon de la Terre en kilomètres

  const lat1 = coord1[1];
  const lon1 = coord1[0];
  const lat2 = coord2[1];
  const lon2 = coord2[0];

  // Convertir les latitudes et longitudes de degrés en radians
  const lat1Rad = degToRad(lat1);
  const lon1Rad = degToRad(lon1);
  const lat2Rad = degToRad(lat2);
  const lon2Rad = degToRad(lon2);

  // Différences de latitude et de longitude
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  // Formule de Haversine pour calculer la distance
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance en kilomètres
  const distance = earthRadiusKm * c;

  return distance;
}

function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

