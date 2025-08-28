// src/geo/service-area.ts
import * as fs from 'fs';
import * as path from 'path';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import type {
  Feature,
  FeatureCollection,
  Geometry,
  MultiPolygon,
  Polygon,
} from 'geojson';

type PolyLike = Polygon | MultiPolygon;
type PolyFeature = Feature<PolyLike>;
type AnyFeature = Feature<Geometry>;
type AnyCollection = FeatureCollection;

let cached: FeatureCollection | Feature<Geometry> | PolyLike | null = null;

function readGeojson() {
  if (cached) return cached;
  const file = path.resolve(process.cwd(), 'geo', 'service-area.geojson'); // <- matches your filename
  const raw = fs.readFileSync(file, 'utf8');
  cached = JSON.parse(raw);
  return cached!;
}

// Return TRUE if point is inside ANY polygon in the file
export function isInsideServiceArea(lat: number, lng: number): boolean {
  const data = readGeojson();
  const pt = point([lng, lat]);

  // Helper to test one polygon/multipolygon
  const testPoly = (poly: PolyLike | PolyFeature) => {
    const geom: PolyLike =
      (poly as PolyFeature).type === 'Feature'
        ? ((poly as PolyFeature).geometry as PolyLike)
        : (poly as PolyLike);
    if (!geom || (geom.type !== 'Polygon' && geom.type !== 'MultiPolygon')) {
      return false;
    }
    return booleanPointInPolygon(pt, { type: 'Feature', geometry: geom, properties: {} });
  };

  // Accept a raw geometry
  if ((data as PolyLike).type === 'Polygon' || (data as PolyLike).type === 'MultiPolygon') {
    return testPoly(data as PolyLike);
  }

  // Accept a single feature
  if ((data as AnyFeature).type === 'Feature') {
    return testPoly(data as AnyFeature as PolyFeature);
  }

  // Accept a FeatureCollection (common from geojson.io)
  if ((data as AnyCollection).type === 'FeatureCollection') {
    const fc = data as AnyCollection;
    for (const f of fc.features) {
      if (
        f.geometry &&
        (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon')
      ) {
        if (testPoly(f as PolyFeature)) return true;
      }
    }
    return false;
  }

  // Unknown shape => treat as outside
  return false;
}
