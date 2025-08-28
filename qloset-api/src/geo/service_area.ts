import fs from 'node:fs';
import path from 'node:path';
import { Feature, Polygon, MultiPolygon } from 'geojson';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';

let polygonGeoJSON: Feature<Polygon | MultiPolygon> | null = null;

export function loadServiceArea(): Feature<Polygon | MultiPolygon> {
  if (polygonGeoJSON) return polygonGeoJSON;
  const p = path.resolve(process.cwd(), 'geo', 'service_area.json');
  const raw = fs.readFileSync(p, 'utf8');
  polygonGeoJSON = JSON.parse(raw);
  return polygonGeoJSON!;
}

export function isInsideServiceArea(lat: number, lng: number): boolean {
  const poly = loadServiceArea();
  return booleanPointInPolygon(point([lng, lat]), poly);
}
