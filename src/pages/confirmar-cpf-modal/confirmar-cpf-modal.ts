import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, AlertController, ViewController } from 'ionic-angular';

import { UserProvider } from "../../providers/user/user";

import { FunctionsUtil } from "../../util/functions.util";

@IonicPage()
@Component({
  selector: 'page-confirmar-cpf-modal',
  templateUrl: 'confirmar-cpf-modal.html',
})
export class ConfirmarCpfModalPage {

  user: any;
  input: string = "";

  constructor(
    // public navCtrl: NavController, 
    private viewCtrl: ViewController, 
    public navParams: NavParams, public events: Events,
    public userProvider: UserProvider, 
    public alertCtrl: AlertController) {

    this.user = this.navParams.get('user');
    this.input = this.user.cpf;
  }

  ionViewDidLoad() {
    // this.userProvider.removeUserLocal()
  }

  save() {
    if (this.input == "") {
      this.showAlert()
    }

    else {
      let result = FunctionsUtil.cleanBRMask(this.input)

      if (result.length == 11 && FunctionsUtil.checkCPF(result)) {
        this.user.cpf = result;
        this.saveUser(this.user);

      } else if (result.length == 14 && FunctionsUtil.checkCNPJ(result)) {
        this.user.cpf = result;
        this.saveUser(this.user);

      } else {
        this.showAlert()
      }
    }
  }

  saveUser(user) {
    this.userProvider.updateUser(user.id, { cpf: user.cpf })
      .then(__ => {
        this.closeModal();
      })
  }

  showAlert() {
    this.alertCtrl.create(
      {
        title: "Inválido",
        message: "Insira um CPF ou CPNJ válido",
        buttons: [{
          text: 'OK',
        }]
      }
    ).present()
  }

  closeModal() {
    // this.navCtrl.pop()
    this.viewCtrl.dismiss()
  }

}
