import { Component } from "@angular/core";
import { AlertController, IonicPage, NavController, NavParams, LoadingController, PopoverController, Events } from "ionic-angular";

import { User } from "../../models/user";
import { CadModel } from "../../models/cad";

import { UserProvider } from "../../providers/user/user";
import { CadsProvider } from "../../providers/cads/cads";

import { MyApp } from "../../app/app.component";
import { MapUtil } from "../../util/map.util";
import { Constants } from "../../environments/constants";
import { environment } from './../../environments/environment';

@IonicPage()
@Component({
    selector: 'page-comprar-creditos',
    templateUrl: 'comprar-creditos.html'
})
export class ComprarCreditosPage {

    price: number = 0;
    cads: number = 0;
    cad = new CadModel();
    fromPage;
    area;
    setor;
    qtdCads;
    user = new User();
    desconto = 0;
    cielo: boolean = true;
    showSpinner: boolean = true;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public alertCtrl: AlertController,
        private loadingCtrl: LoadingController,
        public popoverCtrl: PopoverController,
        private userProvider: UserProvider,
        private cadProvider: CadsProvider,
        private events: Events) {

        MyApp.MAP_LOAD = false;
        MapUtil.circles.pop();
    }

    ionViewCanEnter() {
       
        this.userProvider.getUserLocal().then(userID => {
            if (userID) {
                this.userProvider.byId(userID).take(1).subscribe(_user => {
                    this.user = new User(_user);
                    this.showSpinner = false
                });

                return true;
            }
        });
    }

    ionViewDidLoad() {
        this.fromPage = this.navParams.get('fromPage');
        console.log(this.fromPage)
        if (this.fromPage == 'estacionar') {
            this.area = this.navParams.get('area');
            this.setor = this.navParams.get('setor');
            this.qtdCads = this.navParams.get('qtdCads');
        }

        this.cadProvider.find().take(1).subscribe(item => {
            item.map(item => {
                this.cad = new CadModel(item.cad);
                if (this.cad.gateway === 'pagarme') {
                    this.cielo = false;
                    environment.cielo = false;
                } else {
                    this.cielo = true;
                    environment.cielo = true;
                }
            });
        });
    }

    ionViewWillLeave() {
    }

    selecionarQtd(value) {
        this.cads += value;
        this.price += value * this.cad.valor_unitario;
        this.desconto = (this.user.percent / 100) * this.cad.valor_unitario * this.cads;
    }

    clean() {
        this.cads = 0;
        this.price = 0;
        this.desconto = 0;
    }

    formaPagamento() {
        const precoComDesconto = (this.price - this.desconto);
        const precoComDescontoAbs = parseInt(precoComDesconto.toString());


        if (!environment.cielo && (precoComDesconto - precoComDescontoAbs !== 0)) {
            this.showAlert("Aviso!", "Precisamos fechar em um valor inteiro, isto é, 0 (zero) centavos.", "", () => { });
            return;
        }

        if (this.price > 0 && this.cads > 0) {
            console.log(this.cad.gateway);

            if (!this.cielo) {
                this.comprar()
            } else {
                let alert = this.alertCtrl.create();
                alert.setTitle('Escolha a forma de pagamento');

                alert.addInput({
                    type: 'radio',
                    label: 'Cartão de crédito',
                    value: 'credit',
                    checked: true
                });

                alert.addInput({
                    type: 'radio',
                    label: 'Cartão de débito',
                    value: 'debit'
                });

                alert.addButton('Cancelar');
                alert.addButton({
                    text: 'Comprar',
                    handler: data => {
                        this.comprar(data)
                    }
                });
                alert.present();
            }

        } else {
            this.showAlert("Aviso!", "É preciso selecionar pelo menos 1 CAD para a comprar", "info", () => {
            });
        }

    }

    comprar(method?: string) {
        if (this.fromPage == 'estacionar') {
            this.navCtrl.setRoot(Constants.CREDITOS_PAGAMENTO_PAGE.name, {
                price: (this.price - this.desconto),
                cads: this.cads,
                fromPage: this.fromPage,
                area: this.area,
                setor: this.setor,
                qtdCads: this.cads,
                paymentMethod: method ? method : false,
                desconto: this.desconto,
                descontoPercent: this.user.percent,
                priceNormal: this.price
            });
        } else {
            this.navCtrl.setRoot(Constants.CREDITOS_PAGAMENTO_PAGE.name, {
                price: (this.price - this.desconto),
                cads: this.cads,
                paymentMethod: method ? method : false,
                desconto: this.desconto,
                descontoPercent: this.user.percent,
                priceNormal: this.price,
                fromPage: this.fromPage,
            });
        }

    }
    goPag(cads: number, price: number){
        console.log('POPUP');
        const popover = this.popoverCtrl.create(Constants.CREDITOS_PAGAMENTO_PAGE.name, {
            price: (price - this.desconto),
            cads: cads,
            //paymentMethod: method ? method : false,
            desconto: this.desconto,
            descontoPercent: this.user.percent,
            priceNormal: price,
            fromPage: this.fromPage
        },{cssClass: 'cartao-popover'});
        
        popover.present();

        popover.onDidDismiss(_data => {
            console.log('dismiss', _data);

            this.events.publish('update_saldo', 'update')

            if(_data && _data.gotopage && _data.gotopage === 'historico') {
                this.navCtrl.setRoot(Constants.HISTORICO_PAGE.name, { tab: 'historico-creditos' }).then(() => {
                    this.showAlert("Sucesso!", "Transação realizada com sucesso!", "success", () => {});
                });
            } else if(_data && _data.gotopage && _data.gotopage === 'estacionar') {
                this.showAlert("Sucesso!", "Transação realizada com sucesso!", "success", () => {});
                this.navCtrl.getPrevious().data.qtdCads = _data.qtdCads
                this.navCtrl.pop();
            }
        })
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
        this.showAlert('Ajuda', 'Selecione quantidade de CADs que deseja comprar e em seguida prossiga com o pagamento.', '', () => { })
    }
}
