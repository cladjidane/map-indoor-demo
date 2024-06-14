import type { MapGL } from "./Types";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

class IndoorDraw {
  private _draw: MapboxDraw | null = null;
  private _map: MapGL;

  constructor(map: MapGL) {
    this._map = map;
    
    map.on('indoor.map.loaded', (event) => {
      const indoorMap = event.indoorMap;
      this.initializeDrawControl();
    });
  }

  private initializeDrawControl() {
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
    });
    this._map.addControl(draw);
    this._draw = draw;

    // Maintenant que draw est garanti d'être initialisé, ajouter le bouton
    this.addCustomButton("<span>😅</span>", () =>
      this.showAllFeaturesCoordinates()
    );

    this._map.on("draw.create", () => this.updateDrawLayers());
    this._map.on("draw.update", () => this.updateDrawLayers());
    this._map.on("draw.delete", () => this.updateDrawLayers());
  }

  private addCustomButton(content: string, action: () => void) {
    const button = document.createElement("button");
    button.className = "mapbox-gl-draw_ctrl-draw-btn custom-button";
    button.innerHTML = content;
    button.onclick = action; // Attacher l'action passée au bouton

    // Ajouter le bouton au conteneur de contrôles Mapbox Draw
    const container = this._map
      .getContainer()
      .querySelector(".mapboxgl-ctrl-group");
    if (container) {
      container.appendChild(button);
    } else {
      console.error("Failed to find the Mapbox control container.");
    }
  }

  private showAllFeaturesCoordinates() {
    if (this._draw) {
      const allFeatures = this._draw.getAll();
      if (allFeatures.features.length > 0) {
        const coordinatesList = allFeatures.features.map(
          (feature) => feature.geometry.coordinates
        );
        alert(JSON.stringify(coordinatesList)); // Afficher les coordonnées de toutes les fonctionnalités
      } else {
        alert("No features to display!");
      }
    } else {
      alert("Draw control is not initialized.");
    }
  }

  updateDrawLayers() {
    if (this._draw) {
      const data = this._draw.getAll();
      if (this._map.getSource("drawn-features")) {
        this._map.getSource("drawn-features").setData(data);
      } else {
        this._map.addSource("drawn-features", {
          type: "geojson",
          data,
        });
      }
    }
  }

  get drawInstance(): MapboxDraw | null {
    return this._draw;
  }
}

export default IndoorDraw;
