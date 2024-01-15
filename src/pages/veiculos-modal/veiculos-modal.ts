import { Component } from "@angular/core";
import { IonicPage, NavParams, ViewController } from "ionic-angular";

@IonicPage()
@Component({
    selector: 'veiculos-modal',
    templateUrl: 'veiculos-modal.html'
})

export class VeiculosModalPage {

    todosVeiculos: any[] = [];
    copiaVeiculos: any[] = [];

    veiculos: any[] = [];
    veiculoSelecionado: any[] = [];


    constructor(private viewCtrl: ViewController, private navParams: NavParams) {

    }

    ionViewWillLoad() {
        this.getVeiculos()
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }


    getVeiculos() {
        return new Promise(resolve => {
            let fromPage = this.navParams.get('fromPage')
            let veicTmp = this.navParams.get('veiculos');
            console.log(fromPage)
            let veiculos: any;
            if(fromPage == "tempo_restante"){
                veiculos = veicTmp[0].estacionar;
                console.log(veiculos)
            }else{
                veiculos = veicTmp;
            }
            
            console.log(veiculos)
            this.copiaVeiculos = veiculos ? veiculos : [];
            this.veiculos = veiculos ? veiculos : [];
            resolve(true)
        })
    }

    select(veiculo) {
        this.veiculoSelecionado = veiculo
    }

    procurarVeiculos(event: any) {
        let placa = event.target.value;

        if (placa) {
            if (placa.trim == '') {
                this.veiculos = this.copiaVeiculos;
            } else {
                this.veiculos = this.copiaVeiculos.filter((veiculos) => {
                    console.log(veiculos)
                    return (veiculos && veiculos.veiculo.placa.toUpperCase().indexOf(placa.toUpperCase()) > -1);
                })
            }
        } else {
            this.veiculos = this.copiaVeiculos;
        }

    }

    selectVeiculo() {
        this.viewCtrl.dismiss(this.veiculoSelecionado)
    }

}