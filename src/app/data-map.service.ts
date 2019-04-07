import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable, of } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class DataMapService {

  private url_base = "http://localhost:3000"

  constructor(private http:HttpClient) { }

  getMapFullorReduce(map_reduce:boolean, year:string, data_type:string): Observable<any>{
    if(map_reduce){
      return this.http.get(`${this.url_base}/api/getmap/reduce/${year}/${data_type}`)
    }else{
      return this.http.get(`${this.url_base}/api/getmap/full/${year}/${data_type}`)
    }
    
  }
}
