import { Component } from '@angular/core';
import { AlertController, IonicPage, LoadingController, NavController, NavParams, ViewController } from 'ionic-angular';

import { User } from '../../models/user';

import { PagamentosProvider } from './../../providers/pagamentos/pagamentos';
import { UserProvider } from "../../providers/user/user";

import { MyApp } from "../../app/app.component";
import { MapUtil } from "../../util/map.util";

@IonicPage()
@Component({
    selector: 'page-pagamentos',
    templateUrl: 'pagamentos.html',
})
export class PagamentosPage {

    public user: User;
    list;
    showSpinner: boolean = true;
    fromPage;

    constructor(
        public navCtrl: NavController,
        public viewCtrl: ViewController,
        public navParams: NavParams,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController,
        private userProvider: UserProvider,
        private pagamentosProvider: PagamentosProvider) {

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
    }

    ionViewWillEnter() {
    }

    ionViewDidEnter() {
        this.fromPage = this.navParams.get('fromPage');
        let goPage = this.navParams.get('gotoPage');
        console.log('Param',goPage)

        if(goPage && goPage == 'pagamento'){
            this.navCtrl.pop();
        }
    
        this.carregaCartoes();
    }
        
    private carregaCartoes() {
        this.userProvider.getUserLocal().then(userID => {
            if (userID != null) {
                this.userProvider.byId(userID).take(1).subscribe((user: User) => {
                    this.user = user;
                    this.pagamentosProvider.findByUser(this.user.id).take(1).subscribe(_data => {
                        this.list = _data;
                    });
                    this.showSpinner = false;
                });
            }
        });

    }

    ionViewWillLeave() {
    }

    ionViewDidLeave() {
    }

    ionViewWillUnload() {
    }

    ionViewCanLeave() {
    }

    openPage(event, item, key) {
        event.preventDefault();
        this.navCtrl.push('PagamentosFormPage', { 'item': item, 'user': this.user, 'pgtoAllArr': this.list, 'fromPage': this.fromPage });
    }

    getCartaoNumeroFormat(numero: string) {
        const quatro1 = 'XXXX'; //numero.substr(0,4);
        const quatro2 = 'XXXX'; //numero.substr(4,4);
        const quatro3 = 'XXXX'; //numero.substr(5,4);
        const quatro4 = numero.substr(12);

        return quatro1 + ' ' + quatro2 + ' ' + quatro3 + ' ' + quatro4;
    }

    excluir(event, cartaoId) {
        event.stopPropagation();
        this.onConfirm(() => {
            this.pagamentosProvider.remove(this.user.id, cartaoId).then(_ => {
                this.carregaCartoes();
            });
        })
    }

    onConfirm(success) {
        this.alertCtrl.create({
            title: 'Excluir',
            message: 'Tem certeza que deseja remover este cartão?',
            cssClass: 'alert',
            buttons: [
                {
                    text: 'Sim',
                    cssClass: 'btn-ok',
                    handler: () => {
                        success();
                    }
                },
                {
                    text: 'Não',
                    cssClass: 'btn btn-cancel',
                }
            ]
        }).present();
    }

    loadImageCartao(numero: string) {

        switch (numero.substring(0, 1)) {
            case "4":
                return "assets/imgs/visa.png";
            case "5":
                return "assets/imgs/mastercard.png";
            default:
                return "assets/imgs/creditcard.png";
        }
    }

    showAlert(title: string, msg: string, type: string, callback) {
        let alert = this.alertCtrl.create({
            title: title,
            message: msg,
            cssClass: type,
            buttons: [
                {
                    text: 'OK',
                    cssClass: 'btn-ok',
                    handler: data => {
                        callback();
                    }
                }
            ]
        });
        alert.present();
    }

    openHelp() {
        this.showAlert('Ajuda', 'Adicione uma nova forma de pagamento comprar seus CADs. Você pode também visualizar, alterar ou excluir uma forma de pagamento já existente.', '', () => { })
    }

}
