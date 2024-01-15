import { Component } from '@angular/core';
import {
    AlertController,
    IonicPage,
    Loading,
    LoadingController,
    MenuController,
    NavController,
    NavParams
} from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { AuthProvider } from "../../providers/auth/auth";
import { UserProvider } from "../../providers/user/user";

import { Constants } from "../../environments/constants";

@IonicPage()
@Component({
    selector: 'page-recovery-password',
    templateUrl: 'recovery-password.html',
})
export class RecoveryPasswordPage {

    public recoveryForm: FormGroup;
    submitAttempt: boolean = false;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public menu: MenuController,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController,
        public formBuilder: FormBuilder,
        private authProvider: AuthProvider,
        private userProvider: UserProvider) {

        const emailRegex = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

        this.recoveryForm = formBuilder.group({
            email: ['', Validators.compose([Validators.required, Validators.pattern(emailRegex)])]
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

    recovery() {
        this.submitAttempt = true;

        if (this.isValidAttributes()) {
            let loading: Loading = this.showLoading();
            loading.present();

            this.authProvider.sendPasswordResetEmail(this.recoveryForm.value.email)
                .then(() => {
                    loading.dismiss();
                    this.showAlert('Sucesso!', 'Você receberá um email com instruções para recuperar sua senha.', '', () => {
                        this.navCtrl.setRoot(Constants.LOGIN_PAGE.name);
                    });

                }).catch(error => {
                    loading.dismiss();

                    let errorMessage = 'Não foi possível restaurar sua senha!';

                    if (error['code'] && error['code'] == 'auth/user-not-found') {
                        errorMessage = 'O usuário não está cadastrado!';
                    }

                    this.showAlert("Erro!", errorMessage, "error", () => {
                    });
                });

        } else {
            const warn = 'Insira um email válido para recuperar sua senha!';
            this.showAlert("Aviso", warn, "info", () => {
            });
        }
    }

    isValidAttributes(): Boolean {
        return this.recoveryForm.valid;
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

    showLogin() {
        this.navCtrl.setRoot(Constants.LOGIN_PAGE.name);
    }

    private showLoading(): Loading {
        return this.loadingCtrl.create({ content: 'Aguarde...' });
    }

}
