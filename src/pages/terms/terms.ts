import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';

import { InfoProvider } from './../../providers/info/info';

@IonicPage()
@Component({
    selector: 'page-terms',
    templateUrl: 'terms.html',
})
export class TermsPage {

    termos;
    isToggle = true;
    show = false;

    constructor(private provider: InfoProvider, private params: NavParams,
        private navCtrl: NavController, public navEvents: Events) {
        const isToggleTmp = params.get('isToggle');

        if (!isToggleTmp) {
            this.isToggle = isToggleTmp;
        }
    }

    ionViewDidLoad() {
        this.termos = this.provider.getTermos();

    }

    continuar() {
        this.navCtrl.pop();
        this.navEvents.publish('checked', true)
    }

    closeTermsPage() {
        this.navCtrl.pop();
    }

}
