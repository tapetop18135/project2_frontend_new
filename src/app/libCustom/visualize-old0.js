////////////////////// MAP ///////////////////////////

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
// import Style from 'ol/style/Style'
// import Fill from 'ol/style/Fill'
import Polygon from 'ol/geom/Polygon'
import {Fill, Stroke, Style, Text} from 'ol/style.js';

// import { interactionWithMap } from '../main/mapInteract'

import * as Highcharts from 'highcharts'
import { async } from 'q';
import { callbackify, debug } from 'util';
import { debuglog } from 'util';

export var domainIP = "http://18.136.209.215:8080" // "http://127.0.0.1:3200" //"http://18.136.209.215:8080"// //

export var tempSend = {
    "typeMap": undefined,
    "dataset": "- Non select -",
    "year1": "- Non select -",
    "month1": "- Non select -",
    "day1": "- Non select -",
    "year2": "- Non select -",
    "month2": "- Non select -",
    "day2": "- Non select -",
    "type_index": "- Non select -",
    "ylabel": undefined,
    "unit": "",
    "date_list": undefined,
    "data_list": [],
    "lat_list": undefined,
    "lon_list": undefined,
    "data_now": undefined,
    "date_range": undefined,
    "name_index": "",
    "name_graphM": "",
    "average_world": undefined,
    "data_graph_list": undefined,
    "data_graph_list_now": undefined,
    "modeUSE": undefined,
    "season": ["Ann", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    // "lon_list": undefined,
}

export var tempMapLayer = {
    "baselayer": undefined,
    "gridDataColor": undefined,
    "geojsonlayer": undefined,
    "interactive": undefined,
}

export var tempInteract = {
    "interactive": undefined,
}

var startTime = undefined

export var gridL;
export var grid;
var max_min;

export var map = undefined

var styleGeoe = new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0)'
    }),
    stroke: new Stroke({
      color: '#000',
      width: 1
    })
    // text: new Text({
    //   font: '12px Calibri,sans-serif',
    //   fill: new Fill({
    //     color: '#000'
    //   }),
    //   stroke: new Stroke({
    //     color: '#fff',
    //     width: 3
    //   })
    // })
  });

export var vectorLayerGeo = new Vector({
    source: new souceVector({
        url: `${domainIP}/api/getgeocountry`,
        format: new GeoJSON(),
        // wrapX: false
    }),
    opacity: 0.6,
    //     // styleGeo.getText().setText(feature.get('name'));
    //     return styleGeo;
    //   }
    // // opacity: 0.7
})

export var GeoJsonList = {}

async function genGeoList(data_list, date_list) {
    var arr = ["Ann", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    for (var i = 0; i < arr.length; i++) {
        GeoJsonList[arr[i]] = []
    }
    for (let i = 0; i < date_list.length; i++) {
        for (var j = 0; j < arr.length; j++) {
            GeoJsonList[arr[j]].push(genGeojson(data_list[i]["data"][arr[j]], date_list[i]))
        }
    }
    debugger
}

export var update_getGee = function (year1, year2, dataset, map, index_ = "") {
    tempSend["data_list"] = []
    if (tempSend["modeUSE"] === "RD") {
        if (dataset == "GHCN" && index_ != "") {
            // var index_ = "TX10p"
            debugger
            // var urldata0 = `http://127.0.0.1:3000/api/getmap/rawdata/${dataset}/${year1}/${year2}/${index_}/`
            // var urldata = `http://127.0.0.1:3000/api/getmap/rawdata/${dataset}/${year1}/${year1}/${index_}/`
            // var index_ = index_.split(/(\s+)/)[0];
            // var index_ =
            var usePca = index_.split(/(\s+)/)[2]
            
            var index_ = index_.split(/(\s+)/)[0];
            debugger
            if(usePca == "PCA"){
                var urldata = `${domainIP}/api/getmap/mapPCA/${dataset}/${index_}/`
            }else{
                var urldata = `${domainIP}/api/getmap/mapAVG/${dataset}/${year1}/${year2}/${index_}/`
            }
            
        }
        else {
            var urldata = `${domainIP}/api/getmap/reduce/${year1}/${year2}/${dataset}`
        }

        fetch(urldata).then(function (res) {
            return res.json();
        }).then(function (result) {

            if (dataset == "GHCN") {
                tempSend["typeMap"] = result["data"][0]["type_map"]
                debugger
                var date_list = result["date_range"]
                var data_list = result["data"]
                tempSend["date_range"] = result["data"][0]["date"]
                var typeU = dataset
                debugger
                var avg = averageNew(data_list[date_list[0]]["data"]["Ann"])

                $(".meanStat").html(avg)

                max_min = find_max_min(data_list[date_list[0]]["data"]["Ann"])
                var geojson = genGeojson(data_list[date_list[0]]["data"]["Ann"], date_list[0])
                debugger


            } else {
                // console.log(dataset)
                // var date_list = result.data.date_list
                // var data_list = result.data.data_list
                // var lat_list = result.data.lat_list
                // var lon_list = result.data.lon_list
                // var typeU = result.data.typeUse

                // max_min = find_max_min(data_list[date_list[0]])
                // var geojson = genGeojson(lat_list, lon_list, data_list[date_list[0]], date_list[0])
            }

            if (typeU == "tmax") {
                var gridSize = 1.2
            } else if (typeU == "sst") {
                var gridSize = 2.2
            } else if (typeU == "GHCN") {
                var gridSize = 2.7
            }

            console.log(map.getLayers().array_.length)
            map.removeLayer(tempMapLayer["gridDataColor"])
            map.removeLayer(tempMapLayer["baselayer"])
            console.log(map.getLayers().array_.length)
            gridL = genGridData(geojson, gridSize)

            // debugger
            console.log("-------------------------------------------")
            console.log(gridL)
            console.log("-------------------------------------------")
            tempMapLayer["gridDataColor"] = gridL
            map.addLayer(tempMapLayer["gridDataColor"])
            map.addLayer(tempMapLayer["baselayer"])

            setDisplay(tempSend["typeMap"], tempSend["year1"], tempSend["year2"])
            debugger

            console.log(tempSend)
        })


        setTimeout(function () {
            startTime = new Date().getTime();
            var tyearS = parseInt(year1.slice(0, 4))
            var tyearE = parseInt(year2.slice(0, 4))
            var diff = (tyearE - tyearS) + 1
            var numTotal = diff
            var numUseFetch = 3
            // tempSend["data_list"] = new Array(numTotal)
            var tempDate = []
            // debugger

            for (var i = 0; i < diff; i++) {
                tempDate.push(`${tyearS}-01-01`)
                tempSend["data_list"].push(undefined)
                tyearS += 1
            }
            tempSend["date_list"] = tempDate
            var t = Math.ceil(numTotal / numUseFetch)

            for (var i = 0; i < t; i++) {
                var sli = tempDate.slice(i * numUseFetch, i * numUseFetch + numUseFetch)
                if (i === t - 1) {
                    fetchCustom(dataset, index_, sli, i * numUseFetch, tempSend["data_list"].length)
                } else {
                    fetchCustom(dataset, index_, sli, i * numUseFetch, i * numUseFetch + numUseFetch)
                }
                // fetchCustom(dataset, index_, sli, i * numUseFetch, i * numUseFetch + numUseFetch)
                // debugger
            }

        }, 1)

    }

    if (tempSend["modeUSE"] === "DR") {
        // api/getmap/dimenstionR/<type_method>/<type_map>'
        var type_map = dataset
        var type_method = index_
        var urldata = `${domainIP}/api/getmap/dimenstionR/${type_map}/${type_method}`
        $.getJSON(urldata, function (result) {

            map = genMap("mapV")
            var data = result["data"]
            var data_list = data["data_eofs"]
            var date_list = data["date_range"]
            var data_graph_list = data["data_pc"]
            var lat_list = data["lat_list"]
            var lon_list = data["lon_list"]
            var typeU = type_method
            var typeM = type_map

            var tempDate = []
            var ts = parseInt(date_list[0].slice(0, 4))
            var te = parseInt(date_list[1].slice(0, 4)) + 1
            // debugger
            while (1) {
                for (var i = 1; i < 13; i++) {
                    tempDate.push(`${ts}-0${i}-01`)
                }
                ts += 1
                if (ts === te) {
                    break;
                }
            }

            tempSend["lat_list"] = lat_list
            tempSend["lon_list"] = lon_list
            tempSend["date_list"] = tempDate
            tempSend["data_list"] = data_list
            tempSend["data_graph_list"] = data_graph_list
            tempSend["data_now"] = data_list[0]
            tempSend["data_graph_list_now"] = data_list[0]

            tempSend["ylabel"] = ""
            tempSend["name_index"] = data["method_name"].toUpperCase() + "PC 1"
            tempSend["name_graphS"] = `${tempSend["date_list"][0]} - ${tempSend["date_list"][tempSend["date_list"].length - 1]}`
            tempSend["name_graphM"] = "Show Graph PCA with Index"

            // debugger
            max_min = find_max_min(data_list[0])
            // debugger
            var geojson = genGeojson(lat_list, lon_list, data_list[0], date_list[0])
            // debugger
            console.log(map.getLayers().array_.length)
            map.removeLayer(gridL)
            console.log(map.getLayers().array_.length)
            gridL = genGridData(geojson, 2.2)
            // debugger
            // // debugger
            console.log("-------------------------------------------")
            console.log(gridL)
            console.log("-------------------------------------------")
            map.addLayer(gridL)
            // map.addLayer(tempMapLayer["baselayer"])


        });

    }




}

export function updateMapWithDate(map, data, geojsonNow) {
    // var baseLayer = map.getLayers().array_[0]
    // var listLayer = map.getLayers().array_
    // for (var i = 0; i < listLayer.length; i++) {
    //     map.removeLayer(listLayer[i])
    // }
    // map.addLayer(tempMapLayer["baselayer"])
    // map.removeLayer(tempMapLayer["gridDataColor"])
    
    // gridL = genGridData(geojsonNow, 2.7)
    // map.addLayer(gridL)


    debugger 
    tempMapLayer["geojsonlayer"].clear()
    
    
    debugger 
    var tempNewGeojson = new GeoJSON().readFeatures(geojsonNow)
    debugger 
    tempMapLayer["geojsonlayer"].addFeatures(tempNewGeojson)

    debugger
}

export function genGeojson(data_list, date) {
    var multi = 1
    if(tempSend["typeMap"] == "avg"){
        multi = 1
    }else if(tempSend["typeMap"] == "dm" || tempSend["typeMap"] == "trend"){
        multi = 100
    }

    var points = {
        type: 'FeatureCollection',
        features: []
    };
    
    for (var i = 0; i < data_list.length; i += 1) {
        points.features.push({
            type: 'Feature',
            properties: { "value": data_list[i]["value"] * multi, "lat": data_list[i]["lat"], "lon": data_list[i]["lon"], "date": date },
            geometry: {
                type: 'Point',
                coordinates: [ (data_list[i]["lon"] >= 180) ? data_list[i]["lon"] - 360 : data_list[i]["lon"] 
                    ,
                     data_list[i]["lat"]
                    ]
            }
        })
    }

    return points
}

var styleGeo = new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0)'
    }),
    stroke: new Stroke({
      color: '#000',
      width: 1
    })
    // text: new Text({
    //   font: '12px Calibri,sans-serif',
    //   fill: new Fill({
    //     color: '#000'
    //   }),
    //   stroke: new Stroke({
    //     color: '#fff',
    //     width: 3
    //   })
    // })
  });


export function genMap(target) {
    console.log("--------- GEN MAP ---------")
    var basesource = new Tile({
        source: new OSM({})
    })

    var BasevectorLayerGeo = new Vector({
        source: new souceVector({
            url: `${domainIP}/api/getgeocountry`,
            format: new GeoJSON(),
            // wrapX: false
        }),
        style: function(feature) {
            // styleGeo.getText().setText(feature.get('name'));
            return styleGeo;
          }
        // opacity: 0.7
    })

    var map = new WebGLMap({
        target: target,
        // layers: [
        //     new Tile({
        //         source: new OSM({})
        //     }),
        // ],
        view: new View({
            projection: 'EPSG:4326',
            center: [0, 0], // [155,0]
            maxZoom: 6.5,
            minZoom: 2,
            zoom: 2.6
        })
    });

    tempMapLayer["baselayer"] = BasevectorLayerGeo//basesource
    console.log("============== BEFORE ==============")
    // map.addLayer(tempMapLayer["baselayer"])
    return map
}


var find_max_min = function (allGrid) {
    var array = allGrid
    var max = array[0]["value"]
    var min = array[0]["value"]
    for (var i = 1; i < (array.length); i++) {
        if (array[i]["value"] > max) {
            max = array[i]["value"]
        } else if (array[i]["value"] < min) {
            min = array[i]["value"]
        }
    }
    $(".maxStat").html(max.toFixed(2))
    $(".minStat").html(min.toFixed(2))
    var multi = 1
    if(tempSend["typeMap"] == "avg"){
        multi = 1
    }else if(tempSend["typeMap"] == "dm" || tempSend["typeMap"] == "trend"){
        multi = 100
    }
    debugger
    return [max * multi, min * multi]
    // for (var i = 0; i < (array.length); i++) {
    //     for (var j = 0; j < array[i].length; j++) {
    //         if (array[i][j] != -99.9999) {
    //             min = array[i][j]
    //             max = array[i][j]
    //             break
    //         }
    //     }
    //     if (min != undefined || max != undefined) {
    //         break
    //     }
    // }
    // while (i < array.length) {
    //     var j = 0
    //     while (j < array[0].length) {
    //         if (array[i][j] != -99.9999) {
    //             if (array[i][j] > max) {
    //                 max = array[i][j]
    //             }
    //             if (array[i][j] < min) {
    //                 min = array[i][j]
    //             }
    //         }

    //         j++
    //     }
    //     i++
    // }

    // return [max, min]
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
        tem.push(max - i * (val_max / ary_color.length))
    }
    tem = tem.sort((a, b) => a - b)
    console.log(tem)
    // debugger
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

    tempMapLayer["geojsonlayer"] = grid
    
    var gridLayer = new Vector({
        source: tempMapLayer["geojsonlayer"],
        style: gridStyle
    });


    return gridLayer

}


/////////////////////////////////////////////////////////
///////////////////////// CHART /////////////////////////
/////////////////////////////////////////////////////////


export function genChart(target, data1, period, nameData1, nameGraph, nameSub, titleY, unit, color, type) {
    console.log(data1)
    Highcharts.chart(target, {
        chart: {
            type: type
        },
        title: {
            text: nameGraph
        },
        subtitle: {
            text: "Period " + nameSub
        },
        xAxis: {
            categories: period
        },
        yAxis: {
            title: {
                text: titleY
            },
            labels: {
                formatter: function () {
                    return this.value + unit;
                }
            }
        },
        tooltip: {
            crosshairs: true,
            shared: true
        },
        plotOptions: {
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function (e) {
                            // var index = tempSend["date_list"].findIndex(function (m) {
                            //     return m === e.point.category
                            // })
                            // var dataU = tempSend["data_list"][index]
                            // updateMapWithDate(map, dataU, GeoJsonList["Ann"][index])
                        }
                    }
                }
            },
            spline: {
                marker: {
                    radius: 4,
                    lineColor: '#666666',
                    lineWidth: 1
                }
            }
        },
        series: [{
            name: nameData1,
            marker: {
                symbol: 'square'
            },
            color: color,
            data: data1

        }]
    });
}

export function genChartDM(target, data1, data2, nameData1, nameData2, period, nameGraph, nameSub, titleY, unit, color1, color2, type) {
    console.log(data1)
    Highcharts.chart(target, {
        chart: {
            type: type
        },
        title: {
            text: nameGraph
        },
        subtitle: {
            text: "Period " + nameSub
        },
        xAxis: {
            categories: period
        },
        yAxis: {
            title: {
                text: titleY
            },
            labels: {
                formatter: function () {
                    return this.value + unit;
                }
            }
        },
        tooltip: {
            crosshairs: true,
            shared: true
        },
        plotOptions: {
            spline: {
                marker: {
                    radius: 4,
                    lineColor: '#666666',
                    lineWidth: 1
                }
            }
        },
        series: [{
            name: nameData1,
            marker: {
                symbol: 'square'
            },
            color: color,
            data: data1

        }, {
            name: nameData2,
            marker: {
                symbol: 'square'
            },
            color: color,
            data: data2

        }
        ]
    });
}



/////////////////////////////////////////////////////
////////////////// VISUALIZE ///////////////////////
//////////////////////////////////////////////////////


$(document).ready(function () {
    // debugger
    $(".customize .step2 .next").hide()

    setDisplay(tempSend["typeMap"], tempSend["year1"], tempSend["year2"])


    $(".ShowDM").on("click", function () {
        console.log(GeoJsonList)
        // debugger
        update_getGee(undefined, undefined, "pca", map, "sst")

    })

    $(".S1").on("change", function () {
        tempSend["modeUSE"] = $(this).val()
        console.log(tempSend)
    })

    $(".customize .next").on("click", function (e) {
        
        e.preventDefault()
        console.log(tempSend)
        console.log("SSSSSSSSSSSSSSS")
        var temp = $(this).parent().parent()
        if (temp.next().attr("class") !== undefined) {
            if (temp.next().attr("class") == "step3") {

                if (map === undefined) { map = genMap("mapV") }

                var year1Start = `${tempSend["year1"]}-0${getMonth(tempSend["month1"])}-01`
                var year2Start = `${tempSend["year2"]}-0${getMonth(tempSend["month2"])}-01`

                var temp_index = tempSend["type_index"]
                update_getGee(year1Start, year2Start, tempSend["dataset"], map, temp_index)
                
                // setDisplay(tempSend["dataset"], tempSend["year1"], tempSend["month1"], tempSend["day1"] = "01")
                // console.log("Step2 next vi")
                // genChart(target, data1, period, nameData1,nameGraph, nameSub, titleY, unit)

                console.log(tempSend)
            }
            temp.hide()
            temp.next().fadeIn(500)
        }
    })

    $(".customize .pre").on("click", function (e) {
        e.preventDefault()
        var temp = $(this).parent().parent()

        if (temp.prev().attr("class") !== undefined) {
            temp.hide()
            temp.prev().fadeIn(500)
        }
    })

    $(".yearS").on("change", function () {
        $(".yearS option:selected").each(function (index) {
            console.log(this)
            tempSend["year1"] = this.value
            checkStep2()
        })
    })

    $(".monthS").on("change", function () {
        $(".monthS option:selected").each(function (index) {
            console.log(this)
            tempSend["month1"] = this.value
            checkStep2()
        })
    })

    $(".yearS2").on("change", function () {
        $(".yearS2 option:selected").each(function (index) {
            console.log(this)
            tempSend["year2"] = this.value
            console.log(tempSend["year2"])
            checkStep2()
            debugger
        })
    })

    $(".monthS2").on("change", function () {
        $(".monthS2 option:selected").each(function (index) {
            console.log(this)
            tempSend["month2"] = this.value
            checkStep2()
        })
    })

    $(".typeMap").on("change", function () {
        $(".typeMap option:selected").each(function (index) {
            console.log(this)
            tempSend["dataset"] = this.value
            checkStep2()
        })
    })

    $(".type_index").on("change", function () {
        $(".type_index option:selected").each(function (index) {
            console.log(this)
            tempSend["type_index"] = this.value
            debugger
            checkStep2()
        })
    })

});

function setDisplay(dataset, date_range1, date_range2) {
    $(".typeMapShow").html(dataset)
    $(".dateRange1").html(date_range1)
    $(".dateRange2").html(date_range2)
}

function getMonth(monthName) {
    var monthArr = ["- Non select -", "January", "February", "March", "April", "May", "June", "July", "August	", "September", "October", "November", "December"]
    // console.log(monthArr.indexOf(monthName))
    return monthArr.indexOf(monthName)
}

function checkStep2() {
    if (tempSend["year1"] === "- Non select -" || tempSend["month1"] === "- Non select -" || tempSend["year2"] === "- Non select -" || tempSend["month2"] === "- Non select -" || tempSend["dataset"] === "- Non select -" || tempSend["type_index"] === "- Non select -") {
        console.log("cant next")
        $(".customize .step2 .next").hide()
        return
    }

    $(".customize .step2 .next").fadeIn(500)
    $(".step2 p.statusCant").html("Can next")
}

function updateMap() { }

/////////////////////////////////////////////////////////
/////////////// Function Stat  //////////////////////////
/////////////////////////////////////////////////////////

function average2D(array) {
    var sum = 0
    var count = 0
    for (var i = 0; i < array.length; i++) {
        for (var j = 0; j < array[i].length; j++) {
            if (array[i][j] != -99.9999) {
                count += 1
                sum += array[i][j]
            }
        }
    }
    return (sum / count).toFixed(2)
}

function averageNew(array) {
    var sum = 0
    // var count = 0
    for (var i = 0; i < array.length; i++) {
        sum += array[i]["value"]
    }
    return (sum / array.length).toFixed(2)
}

function AsynTest1(callback) {
    setTimeout(function () {
        return callback()
    }, 1)
}

function fetchCustom(dataset, index_, sli, init, end) {
    var url = `${domainIP}/api/getmap/rawdata/${dataset}/${sli[0]}/${sli[sli.length - 1]}/${index_}/`
    console.log(url)
    // debugger

    fetch(url).then(function (res) {
        return res.json();
    }).then(function (resultAll) {
        // debugger
        var data_l = resultAll["data"]
        var date_l = resultAll["date_range"]
        var j = 0
        for (var i = init; i < end; i++) {
            tempSend["data_list"][i] = data_l[date_l[j]]
            j += 1
        }
        if (checklistisEmpty(tempSend["data_list"])) {
            calSeasonal()
            console.log(new Date().getTime() - startTime)
            var date_list = tempSend["date_list"]
            var data_list = tempSend["data_list"]
            // var lat_list = resultAll["data"][date_list[0]]["lat_list"]
            // var lon_list = resultAll["data"][date_list[0]]["lon_list"]
            // debugger
            // tempSend["lat_list"] = lat_list
            // tempSend["lon_list"] = lon_list

            // debugger
            tempSend["date_list"] = date_list
            // tempSend["data_list"] = data_list
            tempSend["data_now"] = data_list[date_list[0]]
            tempSend["ylabel"] = data_list[0]["unit"]
            tempSend["name_index"] = data_list[0]["index_name"] + " (" + data_list[0]["short_name"] + ")"
            tempSend["name_graphS"] = `Ann : ${date_list[0]} - ${date_list[date_list.length - 1]}`
            tempSend["name_graphM"] = "Show Golbal Average"

            var arrayGlobalAVG = []
            for (let i = 0; i < date_list.length; i++) {
                arrayGlobalAVG.push(parseFloat(averageNew(data_list[i]["data"]["Ann"])))
            }
            tempSend["average_world"] = arrayGlobalAVG
            // debugger
            AsynTest1(function () {
                genGeoList(tempSend["data_list"], tempSend["date_list"])
            })
            var nameData1 = tempSend["name_index"]
            var nameGraph = tempSend["name_graphM"]
            var nameSub = tempSend["name_graphS"]
            var titleY = tempSend["ylabel"]
            var unit = tempSend["unit"]

            // $(".meanStat").html(tempSend["average_world"][0])

            genChart("graph1", tempSend["average_world"], tempSend["date_list"], nameData1, nameGraph, nameSub, titleY, unit, "#908F8F", 'spline') // areaspline
            arrayGlobalAVG = []
            alert("SuccccccessssssssSS")
            // debugger
        }
    })

}
function checklistisEmpty(array) {
    for (var i = 0; i < array.length; i += 1) {
        if (array[i] === undefined) {
            return false
        }
    }
    return true
}

function calSeasonal() {
    console.log("-------------- Seasnonal -----------------")
    var arrayMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    var arrayData = []
    for (var j in arrayMonth) {
        arrayData.push(undefined)
    }

    AsynTest1(function () {
        var index = 0
        var sum = 0
        var date_li = tempSend["date_list"]
        var data_li = tempSend["data_list"]
        var count = 0
        for (var i = 0; i < date_li.length; i++) {
            for (var j = 0; j < tempSend["data_list"][i]["data"][arrayMonth[index]].length; j++) {
                // sum += tempSend["data_list"][i]["data"][arrayMonth[index]][]
                sum += tempSend["data_list"][i]["data"][arrayMonth[index]][j]["value"]
                count += 1
            }
        }
        arrayData[index] = sum / count
        checklistisEmpty(arrayData)
    })
    AsynTest1(function () {
        var index = 1
        var sum = 0
        var date_li = tempSend["date_list"]
        var data_li = tempSend["data_list"]
        var count = 0
        for (var i = 0; i < date_li.length; i++) {
            for (var j = 0; j < tempSend["data_list"][i]["data"][arrayMonth[index]].length; j++) {
                // sum += tempSend["data_list"][i]["data"][arrayMonth[index]][]
                sum += tempSend["data_list"][i]["data"][arrayMonth[index]][j]["value"]
                count += 1
            }
        }
        arrayData[index] = sum / count
        checklistisEmpty(arrayData)
    })
    AsynTest1(function () {
        var index = 2
        var sum = 0
        var date_li = tempSend["date_list"]
        var data_li = tempSend["data_list"]
        var count = 0
        for (var i = 0; i < date_li.length; i++) {
            for (var j = 0; j < tempSend["data_list"][i]["data"][arrayMonth[index]].length; j++) {
                // sum += tempSend["data_list"][i]["data"][arrayMonth[index]][]
                sum += tempSend["data_list"][i]["data"][arrayMonth[index]][j]["value"]
                count += 1
            }
        }
        arrayData[index] = sum / count
        checklistisEmpty(arrayData)
    })
    AsynTest1(function () {
        var index = 3
        var sum = 0
        var date_li = tempSend["date_list"]
        var data_li = tempSend["data_list"]
        var count = 0
        for (var i = 0; i < date_li.length; i++) {
            for (var j = 0; j < tempSend["data_list"][i]["data"][arrayMonth[index]].length; j++) {
                // sum += tempSend["data_list"][i]["data"][arrayMonth[index]][]
                sum += tempSend["data_list"][i]["data"][arrayMonth[index]][j]["value"]
                count += 1
            }
        }
        arrayData[index] = sum / count
        checklistisEmpty(arrayData)
    })
    AsynTest1(function () {
        var index = 4
        var sum = 0
        var date_li = tempSend["date_list"]
        var data_li = tempSend["data_list"]
        var count = 0
        for (var i = 0; i < date_li.length; i++) {
            for (var j = 0; j < tempSend["data_list"][i]["data"][arrayMonth[index]].length; j++) {
                // sum += tempSend["data_list"][i]["data"][arrayMonth[index]][]
                sum += tempSend["data_list"][i]["data"][arrayMonth[index]][j]["value"]
                count += 1
            }
        }
        arrayData[index] = sum / count
        checklistisEmpty(arrayData)
    })
    AsynTest1(function () {
        var index = 5
        var sum = 0
        var date_li = tempSend["date_list"]
        var data_li = tempSend["data_list"]
        var count = 0
        for (var i = 0; i < date_li.length; i++) {
            for (var j = 0; j < tempSend["data_list"][i]["data"][arrayMonth[index]].length; j++) {
                // sum += tempSend["data_list"][i]["data"][arrayMonth[index]][]
                sum += tempSend["data_list"][i]["data"][arrayMonth[index]][j]["value"]
                count += 1
            }
        }
        arrayData[index] = sum / count
        checklistisEmpty(arrayData)
    })
    AsynTest1(function () {
        var index = 6
        var sum = 0
        var date_li = tempSend["date_list"]
        var data_li = tempSend["data_list"]
        var count = 0
        for (var i = 0; i < date_li.length; i++) {
            for (var j = 0; j < tempSend["data_list"][i]["data"][arrayMonth[index]].length; j++) {
                // sum += tempSend["data_list"][i]["data"][arrayMonth[index]][]
                sum += tempSend["data_list"][i]["data"][arrayMonth[index]][j]["value"]
                count += 1
            }
        }
        arrayData[index] = sum / count
        checklistisEmpty(arrayData)
    })
    AsynTest1(function () {
        var index = 7
        var sum = 0
        var date_li = tempSend["date_list"]
        var data_li = tempSend["data_list"]
        var count = 0
        for (var i = 0; i < date_li.length; i++) {
            for (var j = 0; j < tempSend["data_list"][i]["data"][arrayMonth[index]].length; j++) {
                // sum += tempSend["data_list"][i]["data"][arrayMonth[index]][]
                sum += tempSend["data_list"][i]["data"][arrayMonth[index]][j]["value"]
                count += 1
            }
        }
        arrayData[index] = sum / count
        checklistisEmpty(arrayData)
    })
    AsynTest1(function () {
        var index = 8
        var sum = 0
        var date_li = tempSend["date_list"]
        var data_li = tempSend["data_list"]
        var count = 0
        for (var i = 0; i < date_li.length; i++) {
            for (var j = 0; j < tempSend["data_list"][i]["data"][arrayMonth[index]].length; j++) {
                // sum += tempSend["data_list"][i]["data"][arrayMonth[index]][]
                sum += tempSend["data_list"][i]["data"][arrayMonth[index]][j]["value"]
                count += 1
            }
        }
        arrayData[index] = sum / count
        checklistisEmpty(arrayData)
    })
    AsynTest1(function () {
        var index = 9
        var sum = 0
        var date_li = tempSend["date_list"]
        var data_li = tempSend["data_list"]
        var count = 0
        for (var i = 0; i < date_li.length; i++) {
            for (var j = 0; j < tempSend["data_list"][i]["data"][arrayMonth[index]].length; j++) {
                // sum += tempSend["data_list"][i]["data"][arrayMonth[index]][]
                sum += tempSend["data_list"][i]["data"][arrayMonth[index]][j]["value"]
                count += 1
            }
        }
        arrayData[index] = sum / count
        checklistisEmpty(arrayData)
    })
    AsynTest1(function () {
        var index = 10
        var sum = 0
        var date_li = tempSend["date_list"]
        var data_li = tempSend["data_list"]
        var count = 0
        for (var i = 0; i < date_li.length; i++) {
            for (var j = 0; j < tempSend["data_list"][i]["data"][arrayMonth[index]].length; j++) {
                // sum += tempSend["data_list"][i]["data"][arrayMonth[index]][]
                sum += tempSend["data_list"][i]["data"][arrayMonth[index]][j]["value"]
                count += 1
            }
        }
        arrayData[index] = sum / count
        checklistisEmpty(arrayData)
    })
    AsynTest1(function () {
        var index = 11
        var sum = 0
        var date_li = tempSend["date_list"]
        var data_li = tempSend["data_list"]
        var count = 0
        for (var i = 0; i < date_li.length; i++) {
            for (var j = 0; j < tempSend["data_list"][i]["data"][arrayMonth[index]].length; j++) {
                // sum += tempSend["data_list"][i]["data"][arrayMonth[index]][]
                sum += tempSend["data_list"][i]["data"][arrayMonth[index]][j]["value"]
                count += 1
            }
        }
        arrayData[index] = sum / count
        // checklistisEmpty(arrayData)
        if (checklistisEmpty(arrayData)) {
            // alert("cal Season")
            genChart("chartSeason", arrayData, arrayMonth,
                tempSend["name_index"],
                "Seasonal Graph",
                `${tempSend["date_list"][0]} - ${tempSend["date_list"][tempSend["date_list"].length - 1]}`,
                tempSend["ylabel"], tempSend["unit"], "green", "spline"
            )
            debugger
        }
    })



    // for(var index = 0 ; index < arrayMonth.length ; index++){
    //     AsynTest1(function(){
    //         console.log(index)
    //         var sum = 0
    //         var date_li = tempSend["date_list"]
    //         var data_li = tempSend["data_list"]
    //         var count = 0
    //         for(var i = 0; i < date_li.length; i++){
    //             for(var j = 0; j < tempSend["data_list"][i]["data"][arrayMonth[index]].length; j++){
    //                 // sum += tempSend["data_list"][i]["data"][arrayMonth[index]][]
    //                 sum += tempSend["data_list"][i]["data"][arrayMonth[index]][j]["value"]
    //                 count += 1
    //             }
    //         }
    //         arrayData[index] = sum / count
    //         checklistisEmpty(arrayData)
    //         debugger
    //     })
    // }
}