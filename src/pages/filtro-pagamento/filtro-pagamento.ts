import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Events } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-filtro-pagamento',
  templateUrl: 'filtro-pagamento.html',
})


export class FiltroPagamentoPage {
  selectOption = {
    title: 'Tipo',
    subtitle: 'Escolha o tipo do Filtro',
    mode: 'ios'
  };
  data: any;

  public filter = {
    data: "",
    qtdCads: "",
    valor: ""

  }

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtlr: ViewController,
    public event: Events) {
    this.data = navParams.get('data')
  }

  ionViewDidLoad() {

  }

  Filtro() {
    if (this.filter.data !== "") {
      this.formatDate()
    }
    this.event.publish('pay_filter_event', this.filter)
    this.navCtrl.pop()

  }

  formatDate() {
    let format = this.filter.data.split("-")
    let result = new Date(parseInt(format[0]), parseInt(format[1]) - 1, parseInt(format[2])).toDateString()
    return this.filter.data = result
  }


  closeModal() {
    this.event.publish('', this.filter)
    this.navCtrl.pop()
  }


}

