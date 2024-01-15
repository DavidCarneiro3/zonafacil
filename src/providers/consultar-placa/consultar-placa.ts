import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// import *  as sinesp from "sinesp-nodejs" ;

/**
 * https://github.com/bbarreto/sinesp-nodejs
 * https://github.com/wgenial/consulta-placa-nodejs
 */
@Injectable()
export class ConsultarPlacaProvider {

  constructor(public http: HttpClient) {
    console.log('ConsultarPlacaProvider Provider');
  }

  // getByPlaca(placa: string): Promise<any> {
  //   const plate = placa.replace(/\W/g,"");

  //   return new Promise<any>((resolve, reject) => {

  //     sinesp.consultaPlaca(plate, dados => {
  //       // console.log('placa', dados);
  //       resolve(dados);
  //     }).catch(err => {
  //       reject(err);
  //     });

  //   });
  // }

}
