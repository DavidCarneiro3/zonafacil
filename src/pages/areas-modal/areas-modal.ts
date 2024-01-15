import { Component } from "@angular/core";
import { NavParams, ViewController, IonicPage } from 'ionic-angular';

@IonicPage()
@Component({
    selector: 'areas-modal',
    templateUrl: 'areas-modal.html'
})

export class AreasModalPage {

    areas: any[] = [];
    copiaAreas: any[] = [];
    codigoArea = '';

    constructor(
        public viewCtrl: ViewController,
        public navParams: NavParams
    ) {

    }

    dismiss() {
        this.viewCtrl.dismiss()
    }

    ionViewWillLoad() {
        this.getAreas()
    }

    getAreas() {
        return new Promise(resolve => {
            const areas = this.navParams.get('datas');

            this.areas = areas ? areas : [];
            this.copiaAreas = areas ? areas : []
            resolve(true)
        })
    }

    confirmar() {
        this.viewCtrl.dismiss(this.codigoArea)
    }

    selectArea(codigo: any) {
        this.codigoArea = codigo
    }

    procurarBairro(event: any) {
        let area = '';
        area = event.target.value;

        if (area) {
            if (area.trim() === '') {
                this.areas = this.copiaAreas
            } else {
                this.areas = this.copiaAreas.filter((areas) => {
                    return (areas.endereco && areas.endereco.toUpperCase().indexOf(area.toUpperCase()) > -1);
                })
            }
        } else {
            this.areas = this.copiaAreas;
        }

    }
}