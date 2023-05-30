import 'mapbox-gl/dist/mapbox-gl.css'

import * as React from 'react'

import { IndoorControl, IndoorMap, addIndoorTo } from '../map-indoor/'
import { useCallback, useEffect, useRef, useState } from 'react'

import arena from '../assets/arena.test.json'
import bus from '../assets/ligne-4-bibus-brest-2.json'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken =
  'pk.eyJ1IjoiamVvZnVuIiwiYSI6ImNrd3huZXZjMzAwMWkycXFtb29zeDMxdnMifQ.N0SyKbZ6Br7bCL0IPmUZIg'

const MapIndoorMapbox = () => {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [lng, setLng] = useState(-4.519800633193512)
  //const [lng, setLng] = useState(2.3596569);
  const [lat, setLat] = useState(48.38794021277715)
  //const [lat, setLat] = useState(48.8765734);
  const [zoom, setZoom] = useState(17)

  useEffect(() => {
    if (map.current) return // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom,
    })

    map.current.on('load', function () {
      map.current.addSource('mapillary', bus)

      map.current.addLayer(
        {
          id: 'mapillary', // Layer ID
          type: 'line',
          source: 'mapillary', // ID of the tile source created above
          // Source has several layers. We visualize the one with name 'sequence'.
          'source-layer': 'sequence',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-opacity': 0.6,
            'line-color': 'rgb(53, 175, 109)',
            'line-width': 2,
          },
        }
      )
    })

    addIndoorTo(map.current)
    // Retrieve the geojson from the path and add the map
    const geojson = arena
    console.log(geojson)
    //setTimeout(() => {
    map.current.indoor.addMap(IndoorMap.fromGeojson(geojson))
    // Add the specific control
    console.log(map)
    map.current.addControl(new IndoorControl())
    //}, 2000);
  }, [])

  return (
    <div>
      <div className='sidebar'>
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className='map-container' />
    </div>
  )
}

export default MapIndoorMapbox
