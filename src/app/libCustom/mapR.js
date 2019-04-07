import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import * as L from 'leaflet'

export function genMapOLV(target){
    new Map({
        target: target,
        layers: [
            new TileLayer({
            source: new XYZ({
                url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            })
            })
        ],
        view: new View({
            center: [0, 0],
            zoom: 2
        })
    });
}


export function genMapLFV(target){
    var map = L.map(target).setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    console.log(map)
}
