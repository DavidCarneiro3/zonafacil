import { Component } from '@angular/core';
import {
    AlertController, IonicPage,
    LoadingController, MenuController,
    NavController, NavParams,
    ViewController, Events
} from 'ionic-angular';
import 'rxjs/add/operator/take';

import { User } from "../../models/user";

import { UserProvider } from "../../providers/user/user";
import { LoggerProvider } from '../../providers/logger/logger';

import { Constants } from "../../environments/constants";
import { FunctionsUtil } from "../../util/functions.util";


@IonicPage()
@Component({
    selector: 'page-root',
    templateUrl: 'root.html',
})
export class RootPage {

    user = new User();
    isPDV: boolean = false;
    showCadastro: boolean = false;
    fromPage;
    backoption;

    constructor(
        private events: Events,
        public navCtrl: NavController,
        public viewCtrl: ViewController,
        public navParams: NavParams,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController,
        public menuCtrl: MenuController,
        private logger: LoggerProvider,
        private userProvider: UserProvider) {

        let loading = this.loadingCtrl.create({ content: 'Aguarde...' });
        loading.present();

        this.backoption = navParams.get('backoption');
        let user = navParams.get('user');
        this.fromPage = this.navParams.get('fromPage');
        this.logger.info('userParam: ' + JSON.stringify(user));
        this.logger.info('fromPageParam: ' + this.fromPage);

        if (user) {
            this.userProvider.byId(user.id).take(1).subscribe(_user => {
                this.user = new User(_user);
                this.user.cpf = '';
                if (user.uidAparelho) {
                    this.user.uidAparelho = user.uidAparelho;
                }

                loading.dismiss();
            }, error => {
                console.error(error);
                loading.dismiss();
            });
        } else {
            loading.dismiss();
        }

        // if(this.fromPage == "signup" || this.fromPage == "login") {
        this.showInformation('normal');
        // }
    }

    ionViewCanEnter() {
        //this.setVisibleMenu(false);
        if (this.fromPage == "pdv") {
            this.userProvider.getUserLocal().then(userID => {
                if (userID) {
                    this.showInformation('revendedor');
                    return true;
                }
            });

        } else if (this.fromPage == "signup" || this.fromPage == "login") {
            return true;

        } else {
            // this.showHome();
            this.onBack();
            return false;
        }

    }

    ionViewDidLoad() {
    }

    updateData() {
        let loader = this.loadingCtrl.create({ content: 'Aguarde....' });
        loader.present();


        this.user.cpf = FunctionsUtil.cleanBRMask(this.user.cpf), this.user.phone = FunctionsUtil.cleanBRMask(this.user.phone), this.user.cep = FunctionsUtil.cleanBRMask(this.user.cep);
        if (this.user.cpf == null || this.user.cpf === undefined ||
            (this.user.cpf != null && this.user.cpf !== undefined && this.user.cpf.trim() === '') ||
            (this.user.cpf != null && this.user.cpf !== undefined && this.user.cpf.trim() === '00000000000')
        ) {
            this.showAlert('Aviso!', 'É preciso inserir um CPF/CNPJ válido!', '', () => { });
            loader.dismiss();

        } else if ((this.user.cpf.length == 11 && !FunctionsUtil.checkCPF(this.user.cpf)) ||
            (this.user.cpf.length == 14 && !FunctionsUtil.checkCNPJ(this.user.cpf))) {

            this.showAlert('Aviso!', 'É preciso inserir um CPF/CNPJ válido!', '', () => { });
            loader.dismiss();

        } else if (this.user.sex == null) {
            this.showAlert('Aviso!', 'É preciso escolher seu sexo!', '', () => {
            });
            loader.dismiss();
        } else if ((this.user.cpf.length == 11 && !FunctionsUtil.checkCPF(this.user.cpf)) ||
            (this.user.cpf.length == 14 && !FunctionsUtil.checkCNPJ(this.user.cpf))) {
            this.showAlert('Aviso!', 'É preciso insirir um CPF/CNPJ válido!', '', () => {
            });
            loader.dismiss();
        } else if (this.user.profile == 'revendedor' && (this.user.endereco == '' || this.user.contato == '')) {
            this.showAlert('Aviso!', 'É preciso preencher seus dados de revendedor', '', () => {
            });
            loader.dismiss();
        } else {
            this.logger.info('User: ' + JSON.stringify(this.user));
            this.user = this.setRevendedorProfile(this.user);
            this.userProvider.saveUser(this.user);
            this.events.publish('user:load', this.user.id);
            loader.dismiss();
            if (this.fromPage == "signup" || this.fromPage == "login") {
                this.showHome();
            } else {
                this.onBack();
            }
        }
    }

    setRevendedorProfile(user) {
        user.profile = 'revendedor';
        user.configuracao = { alerta_5_minutos: false, alerta_10_minutos: false, alerta_15_minutos: false, ativacao_expiracao: false };
        return user;
    }

    showInformation(profile) {
        this.showCadastro = true;

        switch (profile) {
            case 'normal':
                this.user.profile = 'user';
                this.isPDV = false;
                break;
            case 'revendedor':
                this.user.profile = 'revendedor';
                this.isPDV = true;
                break;
        }
    }

    onBack() {
        this.viewCtrl.dismiss();
    }

    closeRootPage() {
        this.navCtrl.setRoot(Constants.SIGNUP_PAGE.name);
    }

    showHome() {
        this.setVisibleMenu(true);
        this.navCtrl.setRoot(Constants.PRINCIPAL_PAGE.name);
    }

    showAlert(title: string, msg: string, type: string, callback) {
        this.alertCtrl.create({
            title: title,
            message: msg,
            cssClass: type,
            buttons: [{
                text: 'OK',
                cssClass: 'btn-ok',
                handler: data => {
                    callback();
                }
            }]
        }).present();
    }

    setVisibleMenu(status = false) {
        this.menuCtrl.enable(status);
        this.menuCtrl.swipeEnable(status);
    }

    openHelp() {
        this.showAlert('Ajuda', 'Para se tornar um revendedor do Zona Fácil, precisamos que preencha todos os campos deste formulário.', '', () => { });
    }

}
