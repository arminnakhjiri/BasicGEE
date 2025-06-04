// Define the Area of Interest (AOI) from a table (assumed to be a predefined FeatureCollection or Geometry)
var aoi = table;

// Process the image collection: filter, compute median, and clip to AOI
var imageCollection = imageCollection
  .filterBounds(aoi)                    // Filter images by the Area of Interest
  .filterDate('2024-01-01', '2024-12-31') // Filter images for the year 2024
  .median()                            // Compute the median image to reduce noise
  .clip(aoi);                          // Clip the result to the AOI

// Select RGB bands (assuming Landsat or similar sensor with B4, B3, B2)
var rgb = imageCollection.select(['B4', 'B3', 'B2']);

// Select the panchromatic band (B8)
var pan = imageCollection.select('B8');

// Convert RGB to HSV color space for pansharpening
var hsv = rgb.rgbToHsv();
print('HSV Image:', hsv);

// Perform HSV pansharpening by replacing the value band with the panchromatic band
var hsvSharpened = ee.Image.cat([
  hsv.select('hue'),                   // Retain hue band
  hsv.select('saturation'),            // Retain saturation band
  pan.rename('value')                  // Use panchromatic band as value
]).hsvToRgb();                         // Convert back to RGB
print('HSV Pansharpened Image:', hsvSharpened);

// Select individual RGB bands for Brovey transform
var red = imageCollection.select('B4');
var green = imageCollection.select('B3');
var blue = imageCollection.select('B2');

// Calculate the sum of RGB bands for Brovey normalization
var sumBands = red.add(green).add(blue);

// Apply Brovey transform to each band
var broveyRed = red.divide(sumBands).multiply(pan).rename('B4');     // Brovey transform for red band
var broveyGreen = green.divide(sumBands).multiply(pan).rename('B3'); // Brovey transform for green band
var broveyBlue = blue.divide(sumBands).multiply(pan).rename('B2');   // Brovey transform for blue band

// Combine Brovey-sharpened bands into a single image
var broveySharpened = ee.Image.cat([broveyRed, broveyGreen, broveyBlue]);
print('Brovey Pansharpened Image:', broveySharpened);

// Center the map on the AOI with a zoom level of 11
Map.centerObject(aoi, 11);

// Define visualization parameters
var visTrueColor = {bands: ['B4', 'B3', 'B2']}; // Visualization for true color (RGB)
var visHSV = {bands: ['red', 'green', 'blue']}; // Visualization for HSV-sharpened image

// Add layers to the map for visualization
Map.addLayer(imageCollection, visTrueColor, 'Original True Color');
Map.addLayer(hsvSharpened, visHSV, 'HSV Pansharpened');
Map.addLayer(broveySharpened, visTrueColor, 'Brovey Pansharpened');