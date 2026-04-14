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
export const SENEGAL_CENTER = [14.4974, -14.4524];

// Helper to group users by service for markers
export const groupByService = (users) => {
    const map = {};
    
    // Internal helper to safely extract coordinates (handles strings, numbers, and Keycloak arrays)
    const getSafeCoord = (val) => {
        if (!val) return null;
        let finalVal = val;
        // Handle Keycloak attributes which are often arrays: ["14.49"]
        if (Array.isArray(val) && val.length > 0) finalVal = val[0];
        
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
