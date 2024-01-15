import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

import { ModalProvider } from '../../providers/modal/modal';

import { MapUtil } from "../../util/map.util";

@IonicPage()
@Component({
    selector: 'page-streat-view',
    templateUrl: 'streat-view.html',
})
export class StreatViewPage {

    map: any;
    data: any;
    wait: any;
    mapUtil: MapUtil = new MapUtil();

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public viewCtrl: ViewController,
        private modalProvider: ModalProvider) {

        this.map = this.navParams.get('map');
        this.data = this.navParams.get('data');
        this.wait = this.navParams.get('wait');

    }

    ionViewCanEnter() {
    }

    ionViewWillEnter() {
    }

    ionViewDidLoad() {
        this.mapUtil.streatView(this.map, this.data);
        setInterval(() => {
            this.wait.dismiss();
        }, 3000)
    }

    closeStreatViewPage() {
        this.viewCtrl.dismiss().then(() => {
            this.modalProvider.desactivate();
        });
    }
}
