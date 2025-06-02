var AOI = table; //Define AOI
Map.centerObject(AOI);

// Define the date range 
var startDate = ee.Date('2023-09-01');
var endDate = ee.Date('2024-01-01');

// Load and clip the NO2 ImageCollection to AOI
var NO2 = ee.ImageCollection('COPERNICUS/S5P/OFFL/L3_NO2')
            .select('tropospheric_NO2_column_number_density')
            .filterDate(startDate, endDate)
            .map(function(img) {
              return img.clip(AOI);
            });

// Compute the mean image over the time period
var meanNO2 = NO2.mean().clip(AOI);

// Add the mean image to the map
Map.addLayer(meanNO2, {min: 0, max: 0.0002, palette: ['blue', 'green', 'yellow', 'red']}, 'Mean map');

// Create time series chart with a more appropriate scale
var chart = ui.Chart.image.series(
    NO2,
    AOI,
    ee.Reducer.mean(),
    5000
  )
  .setChartType('ScatterChart')
  .setOptions({
    title: 'NO2 Time Series',
    hAxis: {title: 'Date'},
    vAxis: {title: 'Concentration'},
    series: {
    0: {pointSize: 2, color: 'red'},
   }
  });
  
print(chart);
