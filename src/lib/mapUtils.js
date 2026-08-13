import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet Default Icon Issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Default Constants
export const SENEGAL_CENTER = [14.5, -14.5];
export const DAKAR_CENTER   = [14.6937, -17.4441];
export const SENEGAL_BOUNDS = [
    [12.28, -17.55], // Sud-Ouest
    [16.70, -11.35]  // Nord-Est
];
export const AEME_HQ        = [14.6653, -17.4339];

// Institutional reference points (always visible)
export const REFERENCE_MARKERS = [
    {
        id: 'aeme-hq',
        name: 'Siège Social AEME',
        address: '15 Boulevard de la République, Dakar',
        coords: AEME_HQ,
        type: 'HEADQUARTERS'
    }
];
