"use client"

import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
  createCoordinates,
} from "@vnedyalk0v/react19-simple-maps"
import statesAtlas from "us-atlas/states-10m.json"

interface RoutePoint {
  lat: number
  lng: number
  label?: string
}

interface RouteDot {
  start: RoutePoint
  end: RoutePoint
}

interface USRouteMapProps {
  dots?: RouteDot[]
  lineColor?: string
  ariaLabel?: string
}

function toCoordinates(point: RoutePoint) {
  return createCoordinates(point.lng, point.lat)
}

export default function USRouteMap({
  dots = [],
  lineColor = "#a259ff",
  ariaLabel = "United States route map",
}: USRouteMapProps) {
  const homeBase = dots[0]?.start

  return (
    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg bg-black">
      <ComposableMap
        projection="geoAlbersUsa"
        width={980}
        height={520}
        role="img"
        aria-label={ariaLabel}
        className="h-full w-full"
      >
        <Geographies geography={statesAtlas}>
          {({ geographies, outline, borders }) => (
            <>
              {geographies.map((geo, index) => (
                <Geography
                  key={`${geo.id ?? "state"}-${index}`}
                  geography={geo}
                  fill="#171728"
                  stroke="transparent"
                  strokeWidth={0}
                />
              ))}
              <path d={borders} fill="none" stroke="#4a3f63" strokeWidth={0.65} />
              <path d={outline} fill="none" stroke="#b18aff" strokeWidth={1.4} />
            </>
          )}
        </Geographies>

        <g aria-hidden="true">
          {dots.map((dot, index) => (
            <Line
              key={`${dot.end.label ?? dot.end.lat}-${dot.end.lng}-${index}`}
              from={toCoordinates(dot.start)}
              to={toCoordinates(dot.end)}
              stroke={lineColor}
              strokeWidth={1.25}
              strokeLinecap="round"
              fill="none"
              opacity={0.55}
            />
          ))}
        </g>

        {homeBase && (
          <Marker coordinates={toCoordinates(homeBase)}>
            <circle r={4} fill={lineColor} />
            <circle r={9} fill={lineColor} opacity={0.18} />
          </Marker>
        )}

        {dots.map((dot, index) => (
          <Marker
            key={`${dot.end.label ?? dot.end.lat}-marker-${dot.end.lng}-${index}`}
            coordinates={toCoordinates(dot.end)}
          >
            <circle r={3} fill={lineColor} />
            <circle r={7} fill={lineColor} opacity={0.18} />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  )
}
