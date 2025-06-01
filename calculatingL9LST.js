var aoi = table;

var landsat9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2');

// Filter the collection
var filtered = landsat9
  .filterBounds(aoi)
  .filterDate('2023-01-01', '2023-12-31')
  .filter(ee.Filter.eq('WRS_PATH', 164))
  .filter(ee.Filter.eq('WRS_ROW', 35))
  .filter(ee.Filter.lt('CLOUD_COVER', 10));

// Select the least cloudy image
var image = ee.Image(filtered.sort('CLOUD_COVER').first());

// Apply scaling factor to the ST_B10 band to get temperature in Kelvin
var lstKelvin = image.select('ST_B10')
  .multiply(0.00341802)
  .add(149.0)
  .rename('LST_K');

// Convert to Celsius
var lstCelsius = lstKelvin.subtract(273.15).rename('LST_C');

// Visualize LST in Celsius
Map.centerObject(aoi, 10);
Map.addLayer(lstCelsius.clip(aoi), {
  min: 20,
  max: 45,
  palette: ['blue', 'cyan', 'green', 'yellow', 'red']
}, 'LST (°C)');

// Export LST to Google Drive
Export.image.toDrive({
  image: lstCelsius.clip(aoi),
  description: 'LST_Landsat9_2023',
  folder: 'EarthEngineExports',
  scale: 30,
  region: aoi,
  maxPixels: 1e9
});
