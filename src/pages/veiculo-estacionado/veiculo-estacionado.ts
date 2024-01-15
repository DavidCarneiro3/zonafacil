import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { LocationAccuracy } from '@ionic-native/location-accuracy';

import { UserProvider } from "../../providers/user/user";
import { ModalProvider } from '../../providers/modal/modal';

import { MyApp } from "../../app/app.component";
import { MapUtil } from "../../util/map.util";

declare var google: any;

@IonicPage()
@Component({
    selector: 'page-veiculo-estacionado',
    templateUrl: 'veiculo-estacionado.html',
})
export class VeiculoEstacionadoPage {

    @ViewChild('mapVeiculoEstacionado') mapElement: ElementRef;

    map: any;
    mapUtil: any = new MapUtil();
    lat: number;
    lng: number;
    estacionar;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public modalCtrl: ModalController,
        private userProvider: UserProvider,
        private viewCtrl: ViewController,
        private locationAccuracy: LocationAccuracy,
        private modalProvider: ModalProvider) {

        MyApp.MAP_LOAD = false;
        MapUtil.circles.pop();
    }

    ionViewCanEnter() {
        this.userProvider.getUserLocal().then(userID => {
            if (userID) {
                return true;
            }
        });
    }

    ionViewDidLoad() {
        this.lat = this.navParams.get('lat');
        this.lng = this.navParams.get('lng');
        this.estacionar = this.navParams.get('estacionar');

        this.initMap();
    }

    initMap() {
        if (this.mapElement != null && this.mapElement.nativeElement != null) {
            this.mapUtil.locationAccuracy = this.locationAccuracy;
            this.map = new google.maps.Map(this.mapElement.nativeElement, this.mapUtil.mapOptions());
            this.map.setCenter({ lat: this.lat, lng: this.lng });
            this.map.setZoom(19);

            let marker = new google.maps.Marker({
                position: { lat: this.lat, lng: this.lng }
            });

            marker.setMap(this.map);

            let infowindow = new google.maps.InfoWindow({
                content: "Seu veículo está estacionado aqui!"
            });

            google.maps.event.addListener(marker, 'click', event => {
                infowindow.setPosition(event.latLng);
                infowindow.open(this.map);
            });
        }
    }

    closeVeiculoEstacionadoPage() {
        this.viewCtrl.dismiss().then(() => {
            this.modalProvider.desactivate();
        });
    }

}
