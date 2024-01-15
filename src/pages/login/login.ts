import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    AlertController,
    IonicPage,
    Loading,
    LoadingController,
    MenuController,
    NavController,
    NavParams,
    Events,
    ModalController
} from 'ionic-angular';

import { ConfiguracaoModel } from '../../models/configuracao'

import { AuthProvider } from "../../providers/auth/auth";
import { UserProvider } from "../../providers/user/user";
import { FunctionsUtil } from "../../util/functions.util";
import { NotificationProvider } from '../../providers/notification/notification';
import { LoggerProvider } from '../../providers/logger/logger';

import { Constants } from "../../environments/constants";


@IonicPage()
@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})
export class LoginPage {

    public loginForm: FormGroup;
    submitAttempt: boolean = false;
    uidAparelho: string;

    versao = Constants.VERSAO;

    constructor(
        private events: Events,
        public navCtrl: NavController,
        public navParams: NavParams,
        public formBuilder: FormBuilder,
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        public menu: MenuController,
        private notificationProvider: NotificationProvider,
        public authProvider: AuthProvider,
        public userProvider: UserProvider,
        private logger: LoggerProvider,
        public modalCtrl: ModalController,
    ) {

        let emailRegex = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

        this.loginForm = formBuilder.group({
            email: ['', Validators.compose([Validators.required, Validators.pattern(emailRegex)])],
            password: ['', Validators.compose([Validators.required, Validators.minLength(5)])]
        });
    }

    ionViewCanEnter() {
        this.setVisibleMenu(false);
        this.userProvider.getUserLocal().then(userID => {
            if (!userID) {
                return true;
            }
        });
    }

    ionViewDidLoad() {
    }

    ionViewWillLeave() {
    }

    login() {
        this.submitAttempt = true;

        if (this.loginForm.valid) {
            let loading: Loading = this.loadingCtrl.create({ content: 'Aguarde...' });
            loading.present();

            this.authProvider.login(this.loginForm.value.email, this.loginForm.value.password)
                .then(res => {
                    if (res.logged) {

                        this.logger.info('NOTIFICATION LOGIN. User: ' + res.logged.id);
                        this.notificationProvider.inicialize(res.logged.id);
                        this.updateConfig(res.logged);
                        this.events.publish('user', res.logged)
                    }


                    if ((res.logged.cpf.length == 11 && !FunctionsUtil.checkCPF(res.logged.cpf)) ||
                        (res.logged.cpf.length == 14 && !FunctionsUtil.checkCNPJ(res.logged.cpf))) {
                        this.navCtrl.setRoot(Constants.ROOT_PAGE.name, { user: res.logged, fromPage: 'login' });
                        this.setVisibleMenu(false);
                        loading.dismiss();
                    }

                    else {
                        this.events.publish('user:load', res.logged.id);
                        this.events.publish('user', res.logged)
                        this.navCtrl.setRoot(Constants.PRINCIPAL_PAGE.name);
                        this.setVisibleMenu(true);
                    }
                    loading.dismiss();
                })
                .catch(error => {
                    const message = Constants.FIREBASE_ERRORS[error.code]
                    this.showAlert('Aviso!', message, 'error', () => { });
                    loading.dismiss();
                });
        }
    }

    focusInput(input) {
        input.setFocus();
    }

    showSignUp() {
        this.navCtrl.push(Constants.SIGNUP_PAGE.name, { uidAparelho: this.uidAparelho });
    }

    showRecoverPassword() {
        this.navCtrl.push(Constants.RECOVERY_PASSWORD_PAGE.name);
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

    setVisibleMenu(status = false) {
        this.menu.enable(status);
        this.menu.swipeEnable(status);
    }


    updateConfig({ configuracao, id }) {
        const novaConfiguracao = new ConfiguracaoModel();
        configuracao.hasOwnProperty ? console.log('Usuário já se encontra com as notificações ativas!') : this.userProvider.updateUser(id, { configuracao: novaConfiguracao }).then(response => console.log(`deu isso ${response}`)).catch(err => console.log(`Algo deu errado ${err}`))

    }

    openHelp() {
        this.showAlert('Ajuda', 'Insira o seu e-mail e a sua senha para entrar, caso tenha esquecido clique em recuperar senha, ou clique em cadastrar para criar uma nova conta.', '', () => { })
    }

    openModal() {
        let modal = this.modalCtrl.create(Constants.FILTER_PAGAMENTO_PAGE.name, null, { cssClass: 'modal-alert' })
        modal.present()
    }
}
