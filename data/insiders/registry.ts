/**
 * Generic insider profile registry.
 *
 * Add a new entry here to make a profile available to GenericInsiderProfile.
 * No other files need to be modified - InsidersList falls back to GenericInsiderProfile
 * for any id not covered by a bespoke component.
 */

import reidData from './reid.json';
import hynekData from './hynek.json';
import knappData from './knapp.json';
import keanData from './kean.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const insiderRegistry: Record<string, any> = {
  'harry-reid': reidData,
  'j-allen-hynek': hynekData,
  'george-knapp': knappData,
  'leslie-kean': keanData,
};
