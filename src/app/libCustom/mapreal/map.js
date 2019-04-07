import * as $ from 'jquery'
// import * as d3 from 'd3'
import * as d3 from 'd3'

import Map from 'ol/Map'
import View from 'ol/View'
import Tile from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
// import XYZ from 'ol/source/XYZ';
import Vector from 'ol/layer/Vector'
import souceVector from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import WebGLMap from 'ol/WebGLMap'
import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Polygon from 'ol/geom/Polygon'

import { interactionWithMap } from '../main/mapInteract'

export var gridL;
export var grid;
var max_min;



export var vectorLayerGeo = new Vector({
    source: new souceVector({
        url: 'http://127.0.0.1:3000/api/getgeocountry',
        format: new GeoJSON(),
        //   wrapX: false
    }),
    opacity: 0.7
})

export var getGee = function(isReduce, year1, year2, type_data){
    const map = genMap('mapV')
    // return map
    if(isReduce){
        var urldata = `http://127.0.0.1:3000/api/getmap/reduce/${year1}/${year2}/${type_data}`
        
        // var urldata = `http://127.0.0.1:3000/api/getmap/dimenstionR/${"pca"}/${"sst"}`
        console.log(urldata)
    }
    else{
        var urldata = `http://127.0.0.1:3000/api/getmap/full/${year1}/${year2}/${type_data}`
    }

    $.getJSON(urldata, function (result) {
        
        var date_list = result.data.date_list
        var data_list = result.data.data_list 
        var lat_list =  result.data.lat_list 
        var lon_list =  result.data.lon_list 
        var typeU = result.data.typeUse 

        // console.log(lat_list)
        // console.log(lon_list)
        // console.log(date_list)
        if(typeU == "tmax"){
            var gridSize = 1.2
        }else if(typeU == "sst"){
            var gridSize = 2.2
        }
        // debugger
        max_min = find_max_min(data_list[date_list[0]])
        var geojson = genGeojson(lat_list, lon_list, data_list[date_list[0]])
        debugger
        // console.log(geojson)
        // map.addLayer(vectorLayerGeo)
        gridL = genGridData(geojson, gridSize)
        map.addLayer(gridL)


        //////////// test DR /////////////////

        // var data_list = result.data.data_eofs
        // var lat_list =  result.data.lat_list 
        // var lon_list =  result.data.lon_list 

        // for(var i = 0; i < data_list[1].length; i+= 1){
        //     for(var j = 0; j < data_list[1][i].length; j+= 1){
        //         data_list[1][i][j] *= 100
        //     }
        // }
        
        // max_min = find_max_min(data_list[1])
        
        // var geojson = genGeojson(lat_list, lon_list, data_list[1])
        // gridL = genGridData(geojson, 2.2)
        // map.addLayer(gridL)




    });

    return map
}

export var update_getGee = function(isReduce, year1, year2, type_data, map){
    
    if(isReduce){
        var urldata = `http://127.0.0.1:3000/api/getmap/reduce/${year1}/${year2}/${type_data}`
        console.log(urldata)
    }
    else{
        var urldata = `http://127.0.0.1:3000/api/getmap/full/${year1}/${year2}/${type_data}`
    }

    $.getJSON(urldata, function (result) {
        console.log("TTTTTTTTTTTT")
        
        var date_list = result.data.date_list
        var data_list = result.data.data_list
        var lat_list =  result.data.lat_list 
        var lon_list =  result.data.lon_list 
        var typeU = result.data.typeUse 

        if(typeU == "tmax"){
            var gridSize = 1.2
        }else if(typeU == "sst"){
            var gridSize = 2.2
        }
        // console.log(result.description)
        // var geojson = genGeojson(lat_list, lon_list, data_list)
        
        max_min = find_max_min(data_list[date_list[0]])
        var geojson = genGeojson(lat_list, lon_list, data_list[date_list[0]])
        
        // console.log(geojson)
        // map.addLayer(vectorLayerGeo)
        console.log(map.getLayers().array_.length)
        map.removeLayer(gridL)
        console.log(map.getLayers().array_.length)
        gridL = genGridData(geojson, gridSize)
        console.log("-------------------------------------------")
        console.log(gridL)
        console.log("-------------------------------------------")
        map.addLayer(gridL)
    });
}


export function genGeojson(list_lat, list_lon, data_list) {
    var points = {
        type: 'FeatureCollection',
        features: []
    };
    debugger
    for (var lat_index = 0; lat_index < list_lat.length; lat_index += 1) {
        for (var lot_index = 0; lot_index < list_lon.length; lot_index += 1) {
            if (data_list[lat_index][lot_index] != NaN) {
                // var cors = transform([list_lon[lot_index], list_lat[lat_index]], 'EPSG:4326', 'EPSG:3857')
                points.features.push({
                    type: 'Feature',
                    properties: { "value": data_list[lat_index][lot_index], "lat": list_lat[lat_index], "lon": list_lon[lot_index] },
                    geometry: {
                        type: 'Point',
                        coordinates: [list_lon[lot_index], list_lat[lat_index]]
                    }
                })
            }
        }
    }

    return points
}


export function genMap(target){
    console.log("--------- GEN MAP ---------")
    var map = new WebGLMap({
        target: target,
        layers: [
            new Tile({
                // source: new XYZ({
                //     url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                // })
                source: new OSM({})
            }),
        ],
        view: new View({
            projection: 'EPSG:4326',
            // minResolution: 200,
            // resolution: resolutions,
            center: [0, 0], // [155,0]
            maxZoom: 6.5,
            minZoom: 2,
            zoom: 2.6
        })
    });

    console.log("============== BEFORE ==============")

    return map
}
// var overlay = new Overlay({
//     element: document.getElementById('overlay'),
//     positioning: 'bottom-center'
// });

var find_max_min = function (allGrid) {
    var array = allGrid
    var max = array[0][0]
    var min = array[0][0]
    for (let i = 0; i < (array.length); i++) {
        for (let j = 0; j < array[0].length; j++) {
            if (array[i][j] > max) {
                max = array[i][j]
            }
            if (array[i][j] < min){
                min = array[i][j]
            }
        }
    }
    // var max_value = max
    // var min_value = min
    return [max, min]
}

function colorSelect(colorScale, domainScale) {
    
    
    // if (typeSelect == "ssta" || typeSelect == "sst") {
    var colorScale = d3.scaleThreshold()
        .domain(domainScale)
        .range(colorScale);
    // } else {
    //     var colorScale = d3.scaleThreshold()
    //         .domain([
    //             6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 45
    //             ])
    //         .range([
    //             '#0000CC', '#2861FF', '#61B5FF', '#88DBFF', '#ABF3FF', '#E1FDB8', '#FFEB00', '#FFA400', '#FF3700', '#DC0000',
    //             '#800000',
    //             ]);
    //     // .domain([10, 18, 26, 30, 34, 38, 42]) 
    //     // .range(['#FFFFFF', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026']);
    // }
    return colorScale
}
export function genGridData(geojson, gridSize) {
    
    var max = max_min[0]
    var min = max_min[1]
    var tem = []
    var ary_color = ["#9f0000", "#d50000", "#ff0000", "#ff4900", "#ff9000", "#ffc400", "#ffec00", "#ffff66",
        "#cfffff", "#aff6ff", "#9defff", "#86daff", "#6dc1ff", "#4297ff", "#2050ff", "#050fd9"].reverse()

    var val_max = max + Math.abs(min)
    for (let i = 0; i < ary_color.length; i++) {
        tem.push(max - i * (val_max/ary_color.length))
    }
    tem = tem.sort((a, b) => a - b)
    console.log(tem)
    var gridStyle = function (feature) {

        var coordinate = feature.getGeometry().getCoordinates()

        var x = coordinate[0] - gridSize / 2
        var y = coordinate[1] - gridSize / 2
        var pop = parseInt(feature.getProperties().value)
        // debugger
        var rgb = d3.rgb(colorSelect(ary_color, tem)(pop))

        var scaleX = 0
        var scaleY = 0


        var pos1 = [x - scaleX, y - scaleY]
        var pos2 = [x - scaleX, y + gridSize + scaleY]
        var pos3 = [x + scaleX + gridSize, y + gridSize + scaleY]
        var pos4 = [x + scaleX + gridSize, y - scaleY]
        var pos5 = pos1

        return [
            new Style({
                fill: new Fill({
                    color: [rgb.r, rgb.g, rgb.b, 1]
                }),
                geometry: new Polygon([[
                    pos1, pos2, pos3, pos4, pos5
                ]])
            })
        ];
    };
    
    

    grid = new souceVector({
        features: (new GeoJSON()).readFeatures(geojson),
        // wrapX: false
    })

    var gridLayer = new Vector({
        source: grid,
        style: gridStyle
    });


    return gridLayer

}
