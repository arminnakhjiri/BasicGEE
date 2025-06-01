// This script performs pansharpening on Landsat 9 Level 1 TOA imagery
// for WRS Path 164, Row 35, fusing the panchromatic band (B8) with

var geometry = ee.Geometry.Polygon(
  [[[51.06292958958561, 35.84607683539046],
    [51.06292958958561, 35.559474077751595],
    [51.68365712864811, 35.559474077751595],
    [51.68365712864811, 35.84607683539046]]], null, false);

var aoi = geometry;

// Load Landsat 9 Level 1 TOA collection (includes Band 8)
var landsat9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_TOA');

// Filter the collection by AOI, date (2023), and WRS Path 164, Row 35
var filtered = landsat9
  .filterBounds(aoi)
  .filterDate('2023-01-01', '2023-12-31')
  .filter(ee.Filter.eq('WRS_PATH', 164))
  .filter(ee.Filter.eq('WRS_ROW', 35))
  .filter(ee.Filter.lt('CLOUD_COVER', 10));

// Sort the collection by cloud cover and select the least cloudy image
var image = ee.Image(filtered.sort('CLOUD_COVER').first());

// Print the date of the selected image to the console
print('Selected image date:', image.date().format('YYYY-MM-dd'));

// Select multispectral bands (Red, Green, Blue) and panchromatic band
var rgb = image.select(['B4', 'B3', 'B2']); // Red, Green, Blue
var pan = image.select('B8'); // Panchromatic band

// Convert RGB to HSV (Hue, Saturation, Value)
var hsv = rgb.rgbToHsv();

// Replace the Value component with the panchromatic band
var panSharpened = ee.Image.cat([
  hsv.select('hue'),
  hsv.select('saturation'),
  pan.rename('value')
]).hsvToRgb();

// Visualization parameters for true-color (before pansharpening)
var trueColorVis = {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 0.3,
  gamma: 1.4
};

// Visualization parameters for pansharpened image
var panSharpenedVis = {
  min: 0,
  max: 0.3,
  gamma: 1.4
};

// Center the map on the AOI with a zoom level of 10
Map.centerObject(aoi, 10);

// Add original true-color image to the map, clipped to the AOI
Map.addLayer(image.clip(aoi), trueColorVis, 'True Color (Original)');

// Add pansharpened image to the map, clipped to the AOI
Map.addLayer(panSharpened.clip(aoi), panSharpenedVis, 'Pansharpened RGB');
