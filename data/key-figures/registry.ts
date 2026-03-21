/**
 * Generic insider profile registry.
 *
 * Adding a new Key Figure:
 * 1. Create data/key-figures/[id].json following the standard schema
 * 2. Import it here and add to insiderRegistry
 * 3. Add an entry to data/key-figures/index.json (with includeInExplore: true if warranted)
 * 4. No other files need to be modified
 *
 * Bespoke components (InsidersList.tsx if-chain) are only needed for figures
 * with custom tab structures (currently only Burisch).
 */

// Bespoke-schema profiles (still accessed via their own components)
import burischData from './burisch.json';
import lazarData from './lazar.json';
import gruschData from './grusch.json';
import elizondoData from './elizondo.json';
import fravorData from './fravor.json';
import nellData from './nell.json';
import nolanData from './nolan.json';
import puthoffData from './puthoff.json';
import mellonData from './mellon.json';
import davisData from './davis.json';
import bigelowData from './bigelow.json';
import valleeData from './vallee.json';
import popeData from './pope.json';
import barberData from './barber.json';
import gallaudetData from './gallaudet.json';

// Generic-schema profiles (rendered by GenericInsiderProfile)
import reidData from './reid.json';
import hynekData from './hynek.json';
import knappData from './knapp.json';
import keanData from './kean.json';
import gravesData from './graves.json';
import coulthartData from './coulthart.json';
import lacatskiData from './lacatski.json';
import dolanData from './dolan.json';
import sheehanData from './sheehan.json';
import schumerData from './schumer.json';
import dietrichData from './dietrich.json';
import dayData from './day.json';
import johnMackData from './john-mack.json';
import jesseMichelsData from './jesse-michels.json';
import haraldMalmgrenData from './harald-malmgren.json';
import stantonFriedmanData from './stanton-friedman.json';
import aviLoebData from './avi-loeb.json';
import donaldKeyhoeData from './donald-keyhoe.json';
import philipCorsoData from './philip-corso.json';
import stevenGreerData from './steven-greer.json';
import jayStrattonData from './jay-stratton.json';
import robertHastingsData from './robert-hastings.json';
import seanKirkpatrickData from './sean-kirkpatrick.json';
import dylanBorlandData from './dylan-borland.json';
import matthewBrownData from './matthew-brown.json';
import kitGreenData from './kit-green.json';
import colmKelleherData from './colm-kelleher.json';
import annieJacobsenData from './annie-jacobsen.json';
import jimSemivanData from './jim-semivan.json';
import kirstenGillibrandData from './kirsten-gillibrand.json';
import timBurchettData from './tim-burchett.json';
import johnBurroughsData from './john-burroughs.json';
import edwardRuppeltData from './edward-ruppelt.json';
import jamesMcdonaldData from './james-mcdonald.json';
import dianaPasulkaData from './diana-pasulka.json';
import townsendBrownData from './townsend-brown.json';
import thomasWilsonData from './thomas-wilson.json';
import charlesHaltData from './charles-halt.json';
import marcoRubioData from './marco-rubio.json';
import mikeGallagherData from './mike-gallagher.json';
import peterSturrockData from './peter-sturrock.json';
import nathanTwiningData from './nathan-twining.json';
import jesseMarcelData from './jesse-marcel.json';
import jamesFoxData from './james-fox.json';
import fifeSymingtonData from './fife-symington.json';
import michaelHerreraData from './michael-herrera.json';
import barryGoldwaterData from './barry-goldwater.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const insiderRegistry: Record<string, any> = {
  // Bespoke profiles
  'dan-burisch': burischData,
  'bob-lazar': lazarData,
  'david-grusch': gruschData,
  'luis-elizondo': elizondoData,
  'david-fravor': fravorData,
  'karl-nell': nellData,
  'garry-nolan': nolanData,
  'hal-puthoff': puthoffData,
  'chris-mellon': mellonData,
  'eric-davis': davisData,
  'robert-bigelow': bigelowData,
  'jacques-vallee': valleeData,
  'nick-pope': popeData,
  'jake-barber': barberData,
  'tim-gallaudet': gallaudetData,
  // Generic profiles
  'harry-reid': reidData,
  'j-allen-hynek': hynekData,
  'george-knapp': knappData,
  'leslie-kean': keanData,
  'ryan-graves': gravesData,
  'ross-coulthart': coulthartData,
  'james-lacatski': lacatskiData,
  'richard-dolan': dolanData,
  'daniel-sheehan': sheehanData,
  'chuck-schumer': schumerData,
  'alex-dietrich': dietrichData,
  'kevin-day': dayData,
  'john-mack': johnMackData,
  'jesse-michels': jesseMichelsData,
  'harald-malmgren': haraldMalmgrenData,
  'stanton-friedman': stantonFriedmanData,
  'avi-loeb': aviLoebData,
  'donald-keyhoe': donaldKeyhoeData,
  'philip-corso': philipCorsoData,
  'steven-greer': stevenGreerData,
  'jay-stratton': jayStrattonData,
  'robert-hastings': robertHastingsData,
  'sean-kirkpatrick': seanKirkpatrickData,
  'dylan-borland': dylanBorlandData,
  'matthew-brown': matthewBrownData,
  'kit-green': kitGreenData,
  'colm-kelleher': colmKelleherData,
  'annie-jacobsen': annieJacobsenData,
  'jim-semivan': jimSemivanData,
  'kirsten-gillibrand': kirstenGillibrandData,
  'tim-burchett': timBurchettData,
  'john-burroughs': johnBurroughsData,
  'edward-ruppelt': edwardRuppeltData,
  'james-mcdonald': jamesMcdonaldData,
  'diana-pasulka': dianaPasulkaData,
  'townsend-brown': townsendBrownData,
  'thomas-wilson': thomasWilsonData,
  'charles-halt': charlesHaltData,
  'marco-rubio': marcoRubioData,
  'mike-gallagher': mikeGallagherData,
  'peter-sturrock': peterSturrockData,
  'nathan-twining': nathanTwiningData,
  'jesse-marcel': jesseMarcelData,
  'james-fox': jamesFoxData,
  'fife-symington': fifeSymingtonData,
  'michael-herrera': michaelHerreraData,
  'barry-goldwater': barryGoldwaterData,
};
