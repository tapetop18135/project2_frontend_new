import { Component, OnInit } from '@angular/core';
import { DataMapService } from '../data-map.service'
// import * as mapT from '../libCustom/mapV'
import * as chartT from '../libCustom/chartV'
// import * as mapR from '../libCustom/mapreal/map'


import * as visualizeJS from '../libCustom/main/visualize.js'
import * as interactR from '../libCustom/main/mapInteract.js'

import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-visualize',
  templateUrl: './visualize.component.html',
  styleUrls: ['./visualize.component.css']
})
export class VisualizeComponent implements OnInit {
  
  title = "Climate Information Visualization"
  private map
  private yearStart: string;
  private yearStop: string;

  selectArr = ["- Non select -", "Country", "Custom"]
  selectedOnMap: string = this.selectArr[0]

  selectPeriod = ["- Non select -","January", "February", "March", "April", "May", "June", "July", "August	", "September", "October", "November", "December"]
  selectedPeriod: string = this.selectPeriod[0]

  selectYear = this.genYear(1951, 2017)
  selectedYear: string = this.selectYear[0]

  selectPeriod2 = ["- Non select -","January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  selectedPeriod2: string = this.selectPeriod[0]

  selectYear2 = this.genYear(1951, 2017)
  selectedYear2: string = this.selectYear2[0]

  selectArea = ["- Non select -","World", "Asia", "Africa", "South America", "North America", "Australia", "Europe"]
  selectedArea: string = this.selectArea[0]

  select_dataType = ["- Non select -", "ghcndex"]//,"ecearth_rcp45", "ecearth_rcp85", "mpi_rcp45", "mpi_rcp85"]
  selecteddataType: string = this.select_dataType[0]

  select_dataTypeIndex = ["- Non select -", 'CDD', 'CSDI', 'CWD', 'DTR', 'FD', 'GSL', 'ID', 'PRCPTOT', 'R10mm', 'R20mm', 'R95pT', 'R95p', 'R99p', 'Rx1day', 'Rx5day', 'SDII', 'SU', 'TN10p', 'TN90p', 'TNn', 'TNx', 'TR', 'TX10p', 'TX90p', 'TXn', 'TXx', 'WSDI']
  selecteddataTypeIndex: string = this.select_dataType[0]


  // Step1Choose: string;
  // Step1Array = ['Dimension Reduction', 'Raw Data'];

  genYear(yinit, yend){
    var array = ["- Non select -"]
    var diff = yend - yinit
    for(var i = 0; i <= diff; i+= 1){
      array.push(yinit)
      yinit += 1
    }
    return array;
  }

  imagePath:string = "app/img/icon/angle-arrow-pointing-to-right.png" 



  constructor() {}

  ngOnInit() {
    
    visualizeJS
    interactR
  }
  

  onSelectFeature(name_select){
    if(this.map === undefined){
      this.map = visualizeJS.map_all["map_avg"]
    }
    
    if(name_select === "Select One Point"){
      interactR.selectOnePoint(this.map)
    }
    else if(name_select === "- Non select -"){
      interactR.noSelection(this.map)
    }
    else if(name_select === "Custom"){
      interactR.selectCustom(this.map)
    }
    else if(name_select === "Country"){
      var vectorGeo = visualizeJS.vectorLayerGeo 
      interactR.selectFeatureCountry(this.map, vectorGeo, this.selecteddataType)
    }else{
      console.log("############## No select #################")
    }
    
    // debugger
  }
  onClickMe(){
    console.log(this.selecteddataType)
    console.log(this.selectedPeriod)
    console.log(this.selectedYear)
    this.onSelectMap
  }

  onSelectMap(name_t){
    // this.map = this.onloadMap(true, '1990-06-1', name) 
    visualizeJS.update_getGee(true, this.yearStart, this.yearStop, name_t, this.map)
  }

}

