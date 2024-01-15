import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { CadModel } from './../../models/cad';

import { UserProvider } from "../../providers/user/user";
import { CadsProvider } from './../../providers/cads/cads';
import { BrowserProvider } from './../../providers/browser/browser';
import { LoggerProvider } from '../../providers/logger/logger';

import { Constants } from "../../environments/constants";
import { MyApp } from "../../app/app.component";
import { MapUtil } from "../../util/map.util";

@IonicPage()
@Component({
    selector: 'page-ajuda',
    templateUrl: 'ajuda.html',
})
export class AjudaPage {

    cad = new CadModel();
    versao = Constants.VERSAO;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private browserProvider: BrowserProvider,
        private logger: LoggerProvider,
        private cadsProvider: CadsProvider,
        private userProvider: UserProvider) {

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
        this.cadsProvider.find().take(1).subscribe(value => {
            value.map(item => {
                this.cad = new CadModel(item.cad);
                this.logger.info(this.cad);
            });
        });
    }

    ionViewWillEnter() {
    }

    ionViewDidEnter() {
    }

    ionViewWillLeave() {
    }

    ionViewDidLeave() {
    }

    ionViewWillUnload() {
    }

    openPage(url) {
        this.browserProvider.openPage(url);
    }

    openTerms() {
        this.navCtrl.push(Constants.TERMS_PAGE.name, { isToggle: true });
    }

    goCompartilhar() {
        this.navCtrl.push(Constants.COMPARTILHAR_PAGE.name);
    }

}
