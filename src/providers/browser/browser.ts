import { Platform } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@Injectable()
export class BrowserProvider {

  constructor(private iab: InAppBrowser, private platform: Platform) {
  }

  openPdf(url) {
    if(this.platform.is('android')){
      url = 'https://docs.google.com/gview?embedded=true&url=' + url;
    }

    this.iab.create(url, '_blank', {closebuttoncaption: 'Fechar', toolbarposition: 'top', clearcache: 'yes', location: 'yes', enableViewportScale: 'yes'});
  }

  openPage(url, type=undefined) {
    type = this.getType(type);

    if(type === 'external'){
      this.iab.create(url, '_blank', {closebuttoncaption: 'Fechar', toolbarposition: 'top', clearcache: 'yes', location: 'yes', enableViewportScale: 'yes'});
    } else if(type === 'external_system'){
      this.iab.create(url, '_system', {closebuttoncaption: 'Fechar', toolbarposition: 'top', clearcache: 'yes', location: 'yes' , enableViewportScale: 'yes'});
    }
  }

  getType(type=undefined){
    if(this.platform.is('android')){
      if(type){
        return type;
      }
      return 'external_system';
      
    } else{
      return 'external';
    }    
  }

}
