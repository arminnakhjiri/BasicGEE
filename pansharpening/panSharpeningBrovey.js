// This script performs pansharpening on Landsat 9 Level 1 TOA imagery
// for WRS Path 164, Row 35, with cloud cover < 10%, using the Brovey Transform

var geometry = ee.Geometry.Polygon(
  [[[51.06292958958561, 35.84607683539046],
    [51.06292958958561, 35.559474077751595],
    [51.68365712864811, 35.559474077751595],
    [51.68365712864811, 35.84607683539046]]], null, false);

var aoi = geometry;

// Load Landsat 9 Level 1 TOA collection (includes Band 8)
var landsat9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_TOA');

// Filter the collection by AOI, date (2023), WRS Path 164, Row 35, and cloud cover < 10%
var filtered = landsat9
  .filterBounds(aoi)
  .filterDate('2023-01-01', '2023-12-31')
  .filter(ee.Filter.eq('WRS_PATH', 164))
  .filter(ee.Filter.eq('WRS_ROW', 35))
  .filter(ee.Filter.lt('CLOUD_COVER', 10));

// Sort the collection by cloud cover and select the least cloudy image
var image = ee.Image(filtered.sort('CLOUD_COVER').first());

// Check if an image was found, print a message if none exists
var imageExists = ee.Algorithms.If(
  filtered.size().eq(0),
  print('No images found for Path 164, Row 35 with cloud cover < 10% in 2023'),
  print('Selected image date:', image.date().format('YYYY-MM-dd'))
);

// Select multispectral bands (NIR, Red, Green, Blue) and panchromatic band
var nir = image.select('B5');   // Near-Infrared
var red = image.select('B4');   // Red
var green = image.select('B3'); // Green
var blue = image.select('B2');  // Blue
var pan = image.select('B8');   // Panchromatic band

// Calculate the sum of multispectral bands for Brovey normalization
var bandSum = nir.add(red).add(green).add(blue);

// Brovey Transform: (Band / Sum of bands) * Panchromatic
var broveyNir = nir.divide(bandSum).multiply(pan).rename('B5');
var broveyRed = red.divide(bandSum).multiply(pan).rename('B4');
var broveyGreen = green.divide(bandSum).multiply(pan).rename('B3');
var broveyBlue = blue.divide(bandSum).multiply(pan).rename('B2');

// Combine the pansharpened bands into a single image
var panSharpened = ee.Image.cat([broveyNir, broveyRed, broveyGreen, broveyBlue]);

// Visualization parameters for original false-color (NIR, Red, Green)
var falseColorVis = {
  bands: ['B5', 'B4', 'B3'],
  min: 0,
  max: 0.3,
  gamma: 1.4
};

// Visualization parameters for pansharpened false-color (NIR, Red, Green)
var panSharpenedVis = {
  bands: ['B5', 'B4', 'B3'],
  min: 0,
  max: 0.3,
  gamma: 1.4
};

// Center the map on the AOI with a zoom level of 10
Map.centerObject(aoi, 10);

// Add original false-color image to the map, clipped to the AOI
Map.addLayer(image.clip(aoi), falseColorVis, 'False Color (Original, NIR-Red-Green)');

// Add pansharpened false-color image to the map, clipped to the AOI
Map.addLayer(panSharpened.clip(aoi), panSharpenedVis, 'Pansharpened (Brovey, NIR-Red-Green)');
