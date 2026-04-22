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

// Helper to group users by service for markers
export const groupByService = (users) => {
    const map = {};
    
    // Internal helper to safely extract coordinates (handles strings, numbers, and Keycloak arrays)
    const getSafeCoord = (val) => {
        if (val === null || val === undefined) return null;
        
        let finalVal = val;
        // Handle Keycloak attributes which are often arrays: ["14.49"]
        if (Array.isArray(val)) {
            if (val.length === 0) return null; // Reject empty arrays
            finalVal = val[0];
        }
        
        // Handle empty strings or string "null"
        if (typeof finalVal === 'string') {
            const trimmed = finalVal.trim();
            if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return null;
            finalVal = trimmed;
        }
        
        const num = parseFloat(finalVal);
        return isNaN(num) ? null : num;
    };

    users.forEach(u => {
        // Fallback between different possible field names for the service
        const svc = u.membershipService || u.service || u.department;
        if (!svc || svc.trim() === '') return;

        if (!map[svc]) {
            map[svc] = {
                service: svc,
                coords: null,
                members: []
            };
        }

        // Search for coordinates in multiple possible keys (robustness)
        const lat = getSafeCoord(u.serviceLatitude || u.latitude || u.lat);
        const lon = getSafeCoord(u.serviceLongitude || u.longitude || u.lng || u.lon);

        if (!map[svc].coords && lat !== null && lon !== null) {
            map[svc].coords = [lat, lon];
        }

        // Add member objects
        map[svc].members.push({
            id: u.id,
            name: u.fullName || u.email || 'Membre'
        });
    });

    // Return only services that have at least one coordinate
    return Object.values(map).filter(m => m.coords !== null);
};

/**
 * Group users under official structures for map display
 */
export const groupUsersUnderStructures = (users, structures) => {
    if (!structures) return [];

    // 1. Initialize result with all structures
    const structureMarkers = structures.map(s => ({
        id: s.id,
        name: s.name,
        ministere: s.ministere,
        region: s.region,
        zone: s.zone,
        coords: [parseFloat(s.latitude), parseFloat(s.longitude)],
        type: 'STRUCTURE',
        members: []
    }));

    // 2. Create a lookup map (by name as fallback since we store name in membershipService)
    const structMap = {};
    structureMarkers.forEach(m => {
        structMap[m.name.toLowerCase().trim()] = m;
    });

    // 3. Distribute users
    users.forEach(u => {
        const svcName = (u.membershipService || '').toLowerCase().trim();
        if (structMap[svcName]) {
            structMap[svcName].members.push({
                id: u.id,
                name: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Expert',
                role: u.role
            });
        }
    });

    return structureMarkers.filter(m => !isNaN(m.coords[0]) && !isNaN(m.coords[1]));
};
