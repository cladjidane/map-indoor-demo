import type {
  ExpressionSpecification,
  LayerSpecification,
  Level,
  MapGL,
} from "./Types";
import { bboxCenter, filterWithLevel, overlap } from "./Utils";

import type { BBox } from "geojson";
import IndoorDraw from "./IndoorDraw";
import IndoorMap from "./IndoorMap";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import mapboxgl from "mapbox-gl";
import { default as turfDistance } from "@turf/distance";

type SavedFilter = {
  layerId: string;
  filter: ExpressionSpecification;
};

const SOURCE_ID = "indoor";
const DRAW_SOURCE_ID = "drawn-features";

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
  _draw: IndoorDraw;

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
      this._mapLoadedPromise = new Promise((resolve) => this._map.on("load", resolve));
    }

    this._map.on("moveend", () => this._updateSelectedMapIfNeeded());
  }

  async addMap(indoorMap: IndoorMap) {
    this._indoorMaps.push(indoorMap);
    await this._updateSelectedMapIfNeeded();
  }

  async _updateSelectedMapIfNeeded() {
    await this._mapLoadedPromise;
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

    if (previousMap !== null) {
      previousMap.layersToHide.forEach(layerId => this._map.setLayoutProperty(layerId, "visibility", "visible"));
      previousMap.layers.forEach(({ id }) => this._removeLayerForFiltering(id));
      this._map.removeSource(SOURCE_ID);

      if (!indoorMap) {
        this._previousSelectedLevel = this._level;
        this._previousSelectedMap = previousMap;
      }

      this.setLevel(null, false);
      this._map.fire("indoor.map.unloaded", { indoorMap: previousMap });
    }

    this._selectedMap = indoorMap;
    if (!indoorMap) return;

    const { geojson, layers, levelsRange, beforeLayerId } = indoorMap;

    this._map.addSource(SOURCE_ID, {
      type: "geojson",
      data: geojson,
      lineMetrics: true,
    });

    layers.forEach(layer => this._addLayerForFiltering(layer, beforeLayerId));

    indoorMap.layersToHide.forEach(layerId => this._map.setLayoutProperty(layerId, "visibility", "none"));

    const level = this._previousSelectedMap === indoorMap
      ? this._previousSelectedLevel
      : Math.max(Math.min(indoorMap.defaultLevel, levelsRange.max), levelsRange.min);

    this.setLevel(level, false);

    this._draw = new IndoorDraw(this._map);

    this._map.fire("indoor.map.loaded", { indoorMap });
  }

  _addLayerForFiltering(layer: LayerSpecification, beforeLayerId?: string) {
    this._map.addLayer(layer, beforeLayerId);

    this._savedFilters.push({
      layerId: layer.id,
      filter: (this._map.getFilter(layer.id) as ExpressionSpecification) || [
        "all",
      ],
    });
  }

  _removeLayerForFiltering(layerId: string) {
    this._savedFilters = this._savedFilters.filter(
      ({ layerId: id }) => layerId !== id
    );
    this._map.removeLayer(layerId);
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
      const opacityExpression = [
        "case",
        filterFn(filter),
        0,
        1
      ];
      if(layerId === "indoor-areas") this._map.setPaintProperty(layerId, "fill-opacity", opacityExpression);
      else this._map.setFilter(layerId, filterFn(filter));
    });
  }

  // Permet de gérer les cartes visibles (n'affiche pas les carte hors du bound)
  _closestMap() {
    if (this._map.getZoom() < 17) {
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
}


export default IndoorLayer;
