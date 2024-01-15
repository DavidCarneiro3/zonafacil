import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { User } from "../../models/user";

import { UserProvider } from "../../providers/user/user";

import { MapUtil } from "../../util/map.util";
import { MyApp } from "../../app/app.component";

@IonicPage()
@Component({
    selector: 'page-configuracoes',
    templateUrl: 'configuracoes.html',
})
export class ConfiguracoesPage {

    title1: string;
    title2: string;
    title3: string;
    title4: string;
    title5: string;
    title6: string;
    title7: string;

    user: User;
    userId: string;
    showSpinner: boolean = true;
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private userProvider: UserProvider) {

        MyApp.MAP_LOAD = false;
        MapUtil.circles.pop();
    }

    ionViewCanEnter() {
        this.userProvider.getUserLocal().then(userID => {
            if (userID) {
                this.userProvider.byId(userID).subscribe((user: User) => {
                    this.user = user;
                    this.userId = user.id;
                    this.showSpinner = false;
                });
                return true;
            }
        });
    }

    ionViewDidLoad() {
        this.title1 = "Ativação Expirada";
        this.title2 = "5 minutos antes de expirar";
        this.title3 = "10 minutos antes de expirar";
        this.title4 = "15 minutos antes de expirar";
        this.title5 = "20 minutos antes de expirar";
        this.title6 = "25 minutos antes de expirar";
        this.title7 = "30 minutos antes de expirar";
    }

    ionViewWillLeave() {
    }


    updateConfig(tempo, $event: any) {
        this.userProvider.updateConfig(this.userId, tempo, $event.value)
    }
}
