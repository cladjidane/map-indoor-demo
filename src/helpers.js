import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import n0 from "./datas/n0.json";
import n1 from "./datas/n1.json";
import nmin1 from "./datas/n-1.json";
import nmin2 from "./datas/n-2.json";
import sols from "./datas/sols.json";
import rooms from "./datas/rooms.json";
import gradins from "./datas/gradins.json";
import sieges from "./datas/sieges.json";

export const prepareGeojsonArray = (site) => {
  const geojsonArray = [];

  geojsonArray.push(sols);
  geojsonArray.push(nmin2);
  //geojsonArray.push(nmin1);
  //geojsonArray.push(n1);
  geojsonArray.push(n0);
  geojsonArray.push(rooms.data);
  geojsonArray.push(gradins);
  geojsonArray.push(sieges);

  const staticFeatures = site.allFeatures.map((feature) => ({
    ...feature,
    properties: {
      ...feature.properties,
      indoor: "room",
    },
  }));

//   geojsonArray.push({
//     type: "FeatureCollection",
//     name: "site",
//     features: staticFeatures,
//   });

  geojsonArray.push({
    type: "FeatureCollection",
    name: "site",
    features: site.allFeatures,
  });

  let geojson = {
    type: "FeatureCollection",
    features: geojsonArray.reduce((allFeatures, geojsonData) => {
      return allFeatures.concat(geojsonData.features);
    }, []),
  };

  console.log(geojson);
  return geojson;
};

export const initScrollTrigger = (
  mapContainer,
  sectionMapRef,
  elementsRefs,
  setCurrentStep
) => {
  // Pour gérer le sticky de la carte
  const sectionMap = sectionMapRef.current;
  // Épinglez le premier enfant de #section-map
  ScrollTrigger.create({
    trigger: sectionMap,
    start: "top top",
    //end: () => `+=${sectionMap.offsetHeight - window.innerHeight}`,
    end: "bottom 100%",
    pin: mapContainer.current,
    pinSpacing: false,
    markers: true,
  });

  // Pour gérer les changements de steps / chapters
  elementsRefs.current.forEach((elementRef, index) => {
    gsap.to(elementRef, {
      scrollTrigger: {
        trigger: elementRef,
        start: "top center", // Commence lorsque le haut de l'élément atteint le centre de la fenêtre
        end: "bottom center", // Se termine lorsque le bas de l'élément atteint le centre de la fenêtre
        toggleClass: "active", // Ajoute une classe "active" lorsque le déclencheur est actif
        onToggle: ({ isActive }) => {
          if (isActive) {
            setCurrentStep(index);
            // Désactive tous les autres éléments
            elementsRefs.current.forEach((otherElementRef, otherIndex) => {
              if (index !== otherIndex) {
                gsap.set(otherElementRef, { clearProps: "all" });
              }
            });
          }
        },
      },
    });
  });
};
