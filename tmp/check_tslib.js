import { createRequire } from 'module';
const require = createRequire(import.meta.url);

try {
    const tslibPath = require.resolve('tslib');
    console.log('tslib found at:', tslibPath);
} catch (e) {
    console.log('tslib NOT found:', e.message);
}
