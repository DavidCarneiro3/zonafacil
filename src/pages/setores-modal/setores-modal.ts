import { Component } from "@angular/core";
import { ViewController, LoadingController, ModalController, NavParams, IonicPage } from "ionic-angular";

import { AreaProvider } from "../../providers/area/area";
import { ModalProvider } from "../../providers/modal/modal"

import { MapUtil } from "../../util/map.util";
import { Constants } from "../../environments/constants";

@IonicPage()
@Component({
    selector: "setores-modal",
    templateUrl: "setores-modal.html"
})

export class SetoresModalPage {

    private filtradoPorBairro: boolean = false
    todosSetores: any[] = []
    setoresFiltrados: any[] = []
    copiaSetores: any[] = []

    setores: any[] = []
    setorSelecionado: any[] = []

    mapUtil: MapUtil = new MapUtil();

    constructor(private viewCtrl: ViewController,
        private loadingCtrl: LoadingController,
        private modalCtrl: ModalController,
        private areaProvider: AreaProvider,
        private modalProvider: ModalProvider,
        private navParams: NavParams) {

    }

    ionViewWillLoad() {
        this.getSetores();
    }

    getSetores() {
        return new Promise(resolve => {
            const setores = this.navParams.get('setores');

            this.setores = setores ? setores : [];
            this.todosSetores = setores ? setores : [];
            this.copiaSetores = setores ? setores : [];
            resolve(true)
        })
    }

    select(item) {
        this.setorSelecionado = item
    }

    showSetor() {
        this.viewCtrl.dismiss(this.setorSelecionado)
    }

    dismiss() {
        this.viewCtrl.dismiss(this.setorSelecionado)
    }

    /**
     * Lista apenas os setores que o usuário procura 
     * @param event input do usuário
     */
    procurarZonas(event: any) {
        let zona = event.target.value

        if (zona) {
            if (zona.trim() === '') {
                this.setores = this.copiaSetores;
            } else {
                console.log(this.filtradoPorBairro)
                if (this.filtradoPorBairro) {
                    this.setores = this.setoresFiltrados.filter((setores) => {
                        return (setores.setor && setores.setor.toUpperCase().indexOf(zona.toUpperCase()) > -1);
                    })
                } else {
                    this.setores = this.copiaSetores.filter((setores) => {
                        return (setores.setor && setores.setor.toUpperCase().indexOf(zona.toUpperCase()) > -1);
                    })
                }

            }
        } else {
            this.filtradoPorBairro ? this.setores = this.setoresFiltrados : this.setores = this.copiaSetores
        }
    }

    /**
     * Abre um modal onde ao selecoionar um bairro só mostra os setores do bairro selecionado
     */
    filtrarBairros() {
        let wait = this.loadingCtrl.create({ content: 'Aguarde...' });
        wait.present();
        this.setoresFiltrados = []
        this.filtradoPorBairro = false
        this.areaProvider.getAreas().take(1).subscribe(_areas => {
            const areas = _areas.map(_area => { return { "codigo": _area.key, "endereco": _area.area.endereco } });
            wait.dismiss()
            const areaModal = this.modalCtrl.create(Constants.AREAS_MODAL_PAGE.name, { datas: areas });
            areaModal.present().then(() => {
                this.modalProvider.setActive();
            })
            areaModal.onDidDismiss(data => {
                if (data) {

                    this.todosSetores.forEach(item => {
                        if (item.area.codigo == data) {
                            this.setoresFiltrados.push(item)
                        }
                    })
                    this.filtradoPorBairro = true
                    this.setores = this.setoresFiltrados
                }
            })
        });
    }

    limparFiltros() {
        this.setores = this.todosSetores;
    }

}