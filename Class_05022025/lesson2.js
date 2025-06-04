Map.centerObject(tehran);

var imageCollection = ee.ImageCollection("COPERNICUS/S5P/NRTI/L3_NO2")
                  .filterDate("2021-01-01", "2021-02-01")
                //  .filterBounds(tehran);
                  .min()
                  .clip(tehran);
                  
print(imageCollection);

Map.addLayer(imageCollection);
