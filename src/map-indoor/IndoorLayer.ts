import type {
  ExpressionSpecification,
  LayerSpecification,
  Level,
  MapGL,
} from "./Types";
import { bboxCenter, filterWithLevel, overlap } from "./Utils";

import type { BBox } from "geojson";
import IndoorMap from "./IndoorMap";
import mapboxgl from "mapbox-gl";
import { default as turfDistance } from "@turf/distance";

type SavedFilter = {
  layerId: string;
  filter: ExpressionSpecification;
};

const SOURCE_ID = "indoor";

/**
 * Manage indoor levels
 * @param {Map} map the Mapbox map
 */
class IndoorLayer {
  _map: MapGL;
  _level: Level | null;

  _indoorMaps: Array<IndoorMap>;
  _selectedMap: IndoorMap | null;
  _previousSelectedMap: IndoorMap | null;
  _previousSelectedLevel: Level | null;

  _savedFilters: Array<SavedFilter>;
  _mapLoadedPromise: Promise<void>;

  _updateMapPromise: Promise<void>;

  constructor(map: MapGL) {
    this._map = map;
    this._level = null;

    this._indoorMaps = [];
    this._savedFilters = [];
    this._selectedMap = null;
    this._previousSelectedMap = null;
    this._previousSelectedLevel = null;
    this._updateMapPromise = Promise.resolve();

    if (this._map.loaded()) {
      this._mapLoadedPromise = Promise.resolve();
    } else {
      this._mapLoadedPromise = new Promise((resolve) =>
        this._map.on("load", resolve)
      );
    }

    this._map.on("moveend", () => this._updateSelectedMapIfNeeded());
  }

  getSelectedMap(): IndoorMap | null {
    return this._selectedMap;
  }

  getLevel(): Level | null {
    return this._level;
  }

  setLevel(level: Level | null, fireEvent: Boolean = true): void {
    if (this._selectedMap === null) {
      throw new Error("Cannot set level, no map has been selected");
    }

    this._level = level;
    this._updateFiltering();
    if (fireEvent) {
      this._map.fire("indoor.level.changed", { level });
    }
  }

  /**
   * ***********************
   * Handle level change
   * ***********************
   */

  _addLayerForFiltering(layer: LayerSpecification, beforeLayerId?: string) {
    this._map.addLayer(layer, beforeLayerId);

    this._savedFilters.push({
      layerId: layer.id,
      filter: (this._map.getFilter(layer.id) as ExpressionSpecification) || [
        "all",
      ],
    });
  }

  addLayerForFiltering(layer: LayerSpecification, beforeLayerId?: string) {
    this._addLayerForFiltering(layer, beforeLayerId);
    this._updateFiltering();
  }

  _removeLayerForFiltering(layerId: string) {
    this._savedFilters = this._savedFilters.filter(
      ({ layerId: id }) => layerId !== id
    );
    this._map.removeLayer(layerId);
  }

  removeLayerForFiltering(layerId: string) {
    this._removeLayerForFiltering(layerId);
    this._updateFiltering();
  }

  _updateFiltering() {
    const level = this._level;

    let filterFn: (filter: ExpressionSpecification) => ExpressionSpecification;
    if (level !== null) {
      const showFeaturesWithEmptyLevel = this._selectedMap
        ? this._selectedMap.showFeaturesWithEmptyLevel
        : false;
      filterFn = (filter: ExpressionSpecification) =>
        filterWithLevel(filter, level, showFeaturesWithEmptyLevel);
    } else {
      filterFn = (filter: ExpressionSpecification): ExpressionSpecification =>
        filter;
    }

    this._savedFilters.forEach(({ layerId, filter }) => {
      //this._map.setFilter(layerId, filterFn(filter));
      //console.log(mapboxgl.filterFeatures(filterFn(filter)))

      // Expression de filtre existante

      // Expression modifiée pour renvoyer 0 (masqué) ou 1 (visible)
      const opacityExpression = [
        "case",
        filterFn(filter),  // Si le filtre est satisfait
        0,               // Opacité 0 (masqué)
        1                // Opacité 1 (visible)
      ];
      if(layerId === "indoor-areass") this._map.setPaintProperty(layerId, "fill-opacity", opacityExpression);
      else this._map.setFilter(layerId, filterFn(filter));
    });
  }

  /**
   * **************
   * Handle maps
   * **************
   */

  async addMap(map: IndoorMap) {
    this._indoorMaps.push(map);
    await this._updateSelectedMapIfNeeded();
  }

  async removeMap(map: IndoorMap) {
    this._indoorMaps = this._indoorMaps.filter(
      (_indoorMap) => _indoorMap !== map
    );
    await this._updateSelectedMapIfNeeded();
  }

  async _updateSelectedMapIfNeeded() {
    await this._mapLoadedPromise;

    // Avoid to call "closestMap" or "updateSelectedMap" if the previous call is not finished yet
    await this._updateMapPromise;
    this._updateMapPromise = (async () => {
      const closestMap = this._closestMap();
      if (closestMap !== this._selectedMap) {
        this._updateSelectedMap(closestMap);
      }
    })();
    await this._updateMapPromise;
  }

  _updateSelectedMap(indoorMap: IndoorMap | null) {
    const previousMap = this._selectedMap;

    // Remove the previous selected map if it exists
    if (previousMap !== null) {
      //console.log('Prevuou smap ?')
      previousMap.layersToHide.forEach((layerId) => this._map.setLayoutProperty(layerId, "visibility", "visible"));
      previousMap.layers.forEach(({ id }) => this._removeLayerForFiltering(id));
      this._map.removeSource(SOURCE_ID);

      if (!indoorMap) {
        // Save the previous map level.
        // It enables the user to exit and re-enter, keeping the same level shown.
        this._previousSelectedLevel = this._level;
        this._previousSelectedMap = previousMap;
      }

      this.setLevel(null, false);
      this._map.fire("indoor.map.unloaded", { indoorMap: previousMap });
    }

    this._selectedMap = indoorMap;
    if (!indoorMap) {
      return;
    }

    const { geojson, layers, levelsRange, beforeLayerId } = indoorMap;
    //console.log(geojson, layers, levelsRange, beforeLayerId, "************")

    // Add map source
    this._map.addSource(SOURCE_ID, {
      type: "geojson",
      data: geojson,
      lineMetrics: true,
      //'generateId': true
    });

    // Add layers and save filters
    layers.forEach((layer) => this._addLayerForFiltering(layer, beforeLayerId));

    // Hide layers which can overlap for rendering
    indoorMap.layersToHide.forEach(
      (layerId) => this._map.setLayoutProperty(layerId, "visibility", "none")
    );

    // Restore the same level when the previous selected map is the same.
    const level =
      this._previousSelectedMap === indoorMap
        ? this._previousSelectedLevel
        : Math.max(
            Math.min(indoorMap.defaultLevel, levelsRange.max),
            levelsRange.min
          );

    this.setLevel(level, false);

    this._map.fire("indoor.map.loaded", { indoorMap });
  }

  _closestMap() {
    // TODO enhance this condition
    if (this._map.getZoom() < 16) {
      return null;
    }

    const cameraBounds = this._map.getBounds();
    const cameraBoundsTurf = [
      cameraBounds.getWest(),
      cameraBounds.getSouth(),
      cameraBounds.getEast(),
      cameraBounds.getNorth(),
    ] as BBox;
    const mapsInBounds = this._indoorMaps.filter((indoorMap) =>
      overlap(indoorMap.bounds, cameraBoundsTurf)
    );

    if (mapsInBounds.length === 0) {
      return null;
    }

    if (mapsInBounds.length === 1) {
      return mapsInBounds[0];
    }

    /*
     * If there is multiple maps at this step, select the closest
     */
    let minDist = Number.POSITIVE_INFINITY;
    let closestMap = mapsInBounds[0];
    for (const map of mapsInBounds) {
      const _dist = turfDistance(
        bboxCenter(map.bounds),
        bboxCenter(cameraBoundsTurf)
      );
      if (_dist < minDist) {
        closestMap = map;
        minDist = _dist;
      }
    }
    return closestMap;
  }

  _crossfadeLayer(layerName, targetOpacity, duration) {
    const layer = this._map.getLayer(layerName);

    if (!layer) {
      console.error(`Layer "${layerName}" not found.`);
      return;
    }

    const steps = 50; // Nombre d'étapes pour le fondu
    const currentOpacity = this._map.getPaintProperty(
      layerName,
      "fill-opacity"
    );
    const opacityChange = (targetOpacity - currentOpacity) / steps;

    let currentStep = 0;

    const interval = setInterval(() => {
      const newOpacity = currentOpacity + opacityChange * currentStep;
      this._map.setPaintProperty(layerName, "fill-opacity", newOpacity);

      currentStep++;

      if (currentStep > steps) {
        clearInterval(interval);
      }
    }, duration / steps);
  }
}

export default IndoorLayer;
