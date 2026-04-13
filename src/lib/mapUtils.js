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
    users.forEach(u => {
        const svc = u.membershipService;
        if (!svc || svc.trim() === '') return;

        if (!map[svc]) {
            map[svc] = {
                service: svc,
                coords: null,
                members: []
            };
        }

        // Take coordinates from the first user who has them
        if (!map[svc].coords && u.serviceLatitude && u.serviceLongitude) {
            map[svc].coords = [
                parseFloat(u.serviceLatitude),
                parseFloat(u.serviceLongitude)
            ];
        }

        // Add member names
        map[svc].members.push(u.fullName || u.email);
    });

    // Return only services that have at least one coordinate
    return Object.values(map).filter(m => m.coords !== null);
};
