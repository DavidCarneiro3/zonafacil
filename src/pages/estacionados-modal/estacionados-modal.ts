import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-estacionados-modal',
  templateUrl: 'estacionados-modal.html',
})
export class EstacionadosModalPage {
  todosVeiculos: any[] = [];
    copiaVeiculos: any[] = [];

    veiculos: any[] = [];
    veiculoSelecionado: any[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController) {
    this.getVeiculos()
  }

  ionViewWillLoad() {
   
}

dismiss() {
    this.viewCtrl.dismiss();
}


getVeiculos() {
    return new Promise(resolve => {
        const veiculos = this.navParams.get('veiculos');
        console.log(veiculos)
        this.copiaVeiculos = veiculos ? veiculos : [];
        this.veiculos = veiculos ? veiculos : [];
        console.log(this.veiculos)
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
