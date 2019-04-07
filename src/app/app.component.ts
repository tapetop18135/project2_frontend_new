import { Component } from '@angular/core';

import * as headJS from './libCustom/main/header.js'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Climate Change';
  footer_text = "credit Mr.NUTTAKIT and Mr.PUNTAKARN"
  id:number;

  ngOnInit() {
    headJS
  }

  selectMenu(id){
    console.log(id)
    this.id = id;
  }
}
