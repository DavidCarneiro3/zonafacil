import { Component } from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  ModalController,
  ViewController,
  Events
} from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-filtro-modal',
  templateUrl: 'filtro-modal.html',
})


export class FiltroModalPage {
  selectOption = {
    title: 'Tipo',
    subtitle: 'Escolha o tipo do Filtro',
    mode: 'ios'
  };

  data: any;
  public filter = {
    placa: "",
    numberAuth: "",
    data: "",
    situacao: "",
    qtdCads: "",
    valor: "",
  }

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private modalCtrl: ModalController, public viewCtlr: ViewController, public event: Events) {
    this.data = navParams.get('data')
  }

  ionViewDidLoad() {

  }

  Filtro() {
    if (this.filter.data !== "") {
      this.formatDate()
    }
    this.filter.placa = this.filter.placa.toUpperCase()
    this.event.publish('f_event', this.filter)
    this.navCtrl.pop()

  }

  formatDate() {
    let format = this.filter.data.split("-")
    return this.filter.data = format[2] + '/' + format[1] + '/' + format[0]
  }


  closeModal() {
    this.event.publish('f_event', this.filter)
    this.navCtrl.pop()
  }


}
