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
import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Polygon from 'ol/geom/Polygon'

// import { interactionWithMap } from '../main/mapInteract'

import * as Highcharts from 'highcharts'
import { async } from 'q';
import { callbackify } from 'util';

export var tempSend = {
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
    "data_list": undefined,
    "lat_list": undefined,
    "lon_list": undefined,
    "data_now": undefined,
    "name_index": "",
    "name_graphM": "",
    "average_world": undefined,
    "data_graph_list": undefined,
    "data_graph_list_now": undefined,
    "modeUSE": undefined
    // "lon_list": undefined,
}

export var gridL;
export var grid;
var max_min;

export var map = undefined

export var vectorLayerGeo = new Vector({
    source: new souceVector({
        url: 'http://127.0.0.1:3000/api/getgeocountry',
        format: new GeoJSON(),
        //   wrapX: false
    }),
    opacity: 0.7
})

export var GeoJsonList = []

async function genGeoList(data_list, date_list, lat_list, lon_list) {
    for (let i = 0; i < date_list.length; i++) {
        GeoJsonList.push(genGeojson(lat_list, lon_list, data_list[date_list[i]]["data"], date_list[i]))
    }
}

// export var getGee = function (isReduce, year1, year2, type_data) {
//     // map = genMap('mapV')
//     // return map
//     if (isReduce) {
//         var urldata = `http://127.0.0.1:3000/api/getmap/reduce/${year1}/${year2}/${type_data}`

//         // var urldata = `http://127.0.0.1:3000/api/getmap/dimenstionR/${"pca"}/${"sst"}`
//         console.log(urldata)
//     }
//     else {
//         var urldata = `http://127.0.0.1:3000/api/getmap/full/${year1}/${year2}/${type_data}`
//     }

//     $.getJSON(urldata, function (result) {

//         var date_list = result.data.date_list
//         var data_list = result.data.data_list
//         var lat_list = result.data.lat_list
//         var lon_list = result.data.lon_list
//         var typeU = result.data.typeUse

//         if (typeU == "tmax") {
//             var gridSize = 1.2
//         } else if (typeU == "sst") {
//             var gridSize = 2.2
//         }
//         // debugger
//         max_min = find_max_min(data_list[date_list[0]])
//         var geojson = genGeojson(lat_list, lon_list, data_list[date_list[0]], date_list[0])
//         // debugger
//         // console.log(geojson)
//         // map.addLayer(vectorLayerGeo)
//         gridL = genGridData(geojson, gridSize)
//         map.addLayer(gridL)

//     });

//     return map
// }


export var update_getGee = function (year1, year2, dataset, map, index_ = "") {

    if (tempSend["modeUSE"] === "RD") {
        if (dataset == "GHCN" && index_ != "") {
            // var index_ = "TX10p"
            var urldata0 = `http://127.0.0.1:3000/api/getmap/rawdata/${dataset}/${year1}/${year2}/${index_}/`
            var urldata = `http://127.0.0.1:3000/api/getmap/rawdata/${dataset}/${year1}/${year1}/${index_}/`
        }
        else {
            var urldata = `http://127.0.0.1:3000/api/getmap/reduce/${year1}/${year2}/${dataset}`
        }

        $.getJSON(urldata0, function (resultAll) {
            debugger
            var date_list = resultAll["date_range"]
            var data_list = resultAll["data"]
            var lat_list = resultAll["data"][date_list[0]]["lat_list"]
            var lon_list = resultAll["data"][date_list[0]]["lon_list"]
            debugger
            tempSend["lat_list"] = lat_list
            tempSend["lon_list"] = lon_list
            tempSend["date_list"] = date_list
            tempSend["data_list"] = data_list
            tempSend["data_now"] = data_list[date_list[0]]["data"]
            tempSend["ylabel"] = resultAll["data"][date_list[0]]["unit"]
            tempSend["name_index"] = resultAll["data"][date_list[0]]["index_name"] + " (" + resultAll["data"][date_list[0]]["short_name"] + ")"
            tempSend["name_graphS"] = `${date_list[0]} - ${date_list[date_list.length - 1]}`
            tempSend["name_graphM"] = "Show Golbal Average"

            var arrayGlobalAVG = []
            for (let i = 0; i < date_list.length; i++) {
                arrayGlobalAVG.push(parseFloat(average2D(data_list[date_list[i]]["data"])))
            }
            tempSend["average_world"] = arrayGlobalAVG
            AsynTest1(function () {
                genGeoList(tempSend["data_list"], tempSend["date_list"], lat_list, lon_list)
            })
            var nameData1 = tempSend["name_index"]
            var nameGraph = tempSend["name_graphM"]
            var nameSub = tempSend["name_graphS"]
            var titleY = tempSend["ylabel"]
            var unit = tempSend["unit"]

            $(".meanStat").html(tempSend["average_world"][0])

            genChart("graph1", tempSend["average_world"], tempSend["date_list"], nameData1, nameGraph, nameSub, titleY, unit, "#908F8F", 'areaspline')
            arrayGlobalAVG = []


        })
        $.getJSON(urldata, function (result) {
            if (dataset == "GHCN") {
                debugger
                var date_list = result["date_range"]
                var data_list = result["data"]
                var lat_list = result["data"][date_list[0]]["lat_list"]
                var lon_list = result["data"][date_list[0]]["lon_list"]
                var typeU = dataset
                debugger
                // var arrayGlobalAVG = []

                // tempSend["lat_list"] = lat_list
                // tempSend["lon_list"] = lon_list
                // tempSend["date_list"] = date_list
                // tempSend["data_list"] = data_list
                // tempSend["data_now"] = data_list[date_list[0]]["data"]
                // tempSend["ylabel"] = result["data"][date_list[0]]["unit"]
                // tempSend["name_index"] = result["data"][date_list[0]]["index_name"] + " (" + result["data"][date_list[0]]["short_name"] + ")"
                // tempSend["name_graphS"] = `${date_list[0]} - ${date_list[date_list.length - 1]}`
                // tempSend["name_graphM"] = "Show Golbal Average"

                // for (let i = 0; i < date_list.length; i++) {
                //     arrayGlobalAVG.push(parseFloat(average2D(data_list[date_list[i]]["data"])))
                // }

                // tempSend["average_world"] = arrayGlobalAVG
                // AsynTest1(function () {
                //     genGeoList(tempSend["data_list"], tempSend["date_list"], lat_list, lon_list)
                // })
                // debugger
                max_min = find_max_min(data_list[date_list[0]]["data"][0])
                var geojson = genGeojson(lat_list, lon_list, data_list[date_list[0]]["data"][0], date_list[0])

            } else {
                console.log(dataset)
                var date_list = result.data.date_list
                var data_list = result.data.data_list
                var lat_list = result.data.lat_list
                var lon_list = result.data.lon_list
                var typeU = result.data.typeUse

                max_min = find_max_min(data_list[date_list[0]])
                var geojson = genGeojson(lat_list, lon_list, data_list[date_list[0]], date_list[0])
            }

            if (typeU == "tmax") {
                var gridSize = 1.2
            } else if (typeU == "sst") {
                var gridSize = 2.2
            } else if (typeU == "GHCN") {
                var gridSize = 2.7
            }
            // console.log(result.description)
            // var geojson = genGeojson(lat_list, lon_list, data_list)

            // debugger
            // var geojson = genGeojson(lat_list, lon_list, data_list[date_list[0]])
            // console.log(geojson)
            // map.addLayer(vectorLayerGeo)
            // debugger
            console.log(map.getLayers().array_.length)
            map.removeLayer(gridL)
            console.log(map.getLayers().array_.length)
            gridL = genGridData(geojson, gridSize)

            // debugger
            console.log("-------------------------------------------")
            console.log(gridL)
            console.log("-------------------------------------------")
            map.addLayer(gridL)



            console.log(tempSend)
            // $(".meanStat").html(tempSend["average_world"][0])
            // genChart("graph1", tempSend["average_world"], tempSend["date_list"], nameData1, nameGraph, nameSub, titleY, unit, "#908F8F", 'areaspline')
            // arrayGlobalAVG = []
        });

    }

    if (tempSend["modeUSE"] === "DR") {
        // api/getmap/dimenstionR/<type_method>/<type_map>'
        var type_map = dataset
        var type_method = index_
        var urldata = `http://127.0.0.1:3000/api/getmap/dimenstionR/${type_map}/${type_method}`
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
            debugger
            console.log(map.getLayers().array_.length)
            map.removeLayer(gridL)
            console.log(map.getLayers().array_.length)
            gridL = genGridData(geojson, 2.2)
            debugger
            // // debugger
            console.log("-------------------------------------------")
            console.log(gridL)
            console.log("-------------------------------------------")
            map.addLayer(gridL)



        });

    }




}

export function genGeojson(list_lat, list_lon, data_list, date) {
    var points = {
        type: 'FeatureCollection',
        features: []
    };
    // debugger
    for (var lat_index = 0; lat_index < list_lat.length; lat_index += 1) {
        for (var lot_index = 0; lot_index < list_lon.length; lot_index += 1) {
            if (tempSend["modeUSE"] == "RD") {
                if (data_list[lat_index][lot_index] != -99.9999) {
                    points.features.push({
                        type: 'Feature',
                        properties: { "value": data_list[lat_index][lot_index], "lat": list_lat[lat_index], "lon": list_lon[lot_index], "date": date },
                        geometry: {
                            type: 'Point',
                            coordinates: [list_lon[lot_index], list_lat[lat_index]]
                        }
                    })
                }
            }
            else if (tempSend["modeUSE"] == "DR") {
                if (data_list[lat_index][lot_index]) {
                    points.features.push({
                        type: 'Feature',
                        properties: { "value": data_list[lat_index][lot_index], "lat": list_lat[lat_index], "lon": list_lon[lot_index], "date": date },
                        geometry: {
                            type: 'Point',
                            coordinates: [list_lon[lot_index], list_lat[lat_index]]
                        }
                    })
                }
            }

        }
    }

    return points
}

// export function genGeojsonDR(list_lat, list_lon, data_list, date) {
//     var points = {
//         type: 'FeatureCollection',
//         features: []
//     };
//     // debugger
//     for (var lat_index = 0; lat_index < list_lat.length; lat_index += 1) {
//         for (var lot_index = 0; lot_index < list_lon.length; lot_index += 1) {
//             if(data_list[lat_index][lot_index] == 9.922335884350716e-9){
//                 debugger
//             }
//             if (data_list[lat_index][lot_index] != -99.9999 || data_list[lat_index][lot_index] != 9.922335884350716e-9) {
//                 debugger
//                 points.features.push({
//                     type: 'Feature',
//                     properties: { "value": data_list[lat_index][lot_index], "lat": list_lat[lat_index], "lon": list_lon[lot_index], "date": date },
//                     geometry: {
//                         type: 'Point',
//                         coordinates: [list_lon[lot_index], list_lat[lat_index]]
//                     }
//                 })
//             }
//         }
//     }

//     return points
// }


export function genMap(target) {
    console.log("--------- GEN MAP ---------")
    var map = new WebGLMap({
        target: target,
        layers: [
            new Tile({
                source: new OSM({})
            }),
        ],
        view: new View({
            projection: 'EPSG:4326',
            center: [0, 0], // [155,0]
            maxZoom: 6.5,
            minZoom: 2,
            zoom: 2.6
        })
    });

    console.log("============== BEFORE ==============")

    return map
}


var find_max_min = function (allGrid) {
    var array = allGrid
    var max = undefined
    var min = undefined
    for (var i = 0; i < (array.length); i++) {
        for (var j = 0; j < array[i].length; j++) {
            if (array[i][j] != -99.9999) {
                min = array[i][j]
                max = array[i][j]
                break
            }
        }
        if (min != undefined || max != undefined) {
            break
        }
    }
    while (i < array.length) {
        var j = 0
        while (j < array[0].length) {
            if (array[i][j] != -99.9999) {
                if (array[i][j] > max) {
                    max = array[i][j]
                }
                if (array[i][j] < min) {
                    min = array[i][j]
                }
            }

            j++
        }
        i++
    }

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
        tem.push(max - i * (val_max / ary_color.length))
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


///////////////////////////////////////////////////////
///////////////////////// CHART ////////////////////////
///////////////////////////////////////////////////////


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

    // $(".typeMapShow").html(tempSend["dataset"])
    // $(".yearShow").html(tempSend["year"])
    // $(".monthShow").html(tempSend["month"])
    // $(".dayShow").html(tempSend["day"])

    setDisplay(tempSend["dataset"], tempSend["year1"], tempSend["month1"], tempSend["day1"])

    // $(".customize .")

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

                var year1Start = `${tempSend["year1"]}-${getMonth(tempSend["month1"])}-01`
                var year2Start = `${tempSend["year2"]}-${getMonth(tempSend["month2"])}-01`

                var temp_index = tempSend["type_index"]

                update_getGee(year1Start, year2Start, tempSend["dataset"], map, temp_index)

                setDisplay(tempSend["dataset"], tempSend["year1"], tempSend["month1"], tempSend["day1"] = "01")
                console.log("Step2 next vi")
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
            checkStep2()
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
            checkStep2()
        })
    })

});

function setDisplay(dataset, year, month, day) {
    $(".typeMapShow").html(dataset)
    $(".yearShow").html(year)
    $(".monthShow").html(month)
    $(".dayShow").html(day)
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

function AsynTest1(callback) {
    setTimeout(function () {
        return callback()
    }, 1)
}