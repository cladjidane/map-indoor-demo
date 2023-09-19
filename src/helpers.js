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

export const initScrollTrigger = (
  mapContainer,
  sectionMapRef,
  elementsRefs,
  setCurrentStep
) => {
  const sectionMap = sectionMapRef.current;
  // Épinglez le premier enfant de #section-map
  ScrollTrigger.create({
    trigger: sectionMap,
    start: "top top",
    //end: () => `+=${sectionMap.offsetHeight - window.innerHeight}`,
    end: "bottom 100%",
    pin: mapContainer.current,
    pinSpacing: false,
    //markers: true,
  });

  // Pour gérer les changements de steps / chapters
  elementsRefs.current.forEach((elementRef, index) => {
    ScrollTrigger.create({
      trigger: elementRef,
      start: "top center",
      end: "bottom center",
      //markers: true,
      toggleClass: "active",
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
    });
  });
};
