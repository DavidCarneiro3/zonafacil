import {
    AlertController,
    IonicPage,
    LoadingController,
    MenuController,
    NavController,
    NavParams,
    Platform,
    Events,
    ModalController
} from "ionic-angular";
import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { User } from "../../models/user";

import { LoggerProvider } from "../../providers/logger/logger";
import { AuthProvider } from "../../providers/auth/auth";
import { UserProvider } from "../../providers/user/user";

import { Constants } from "../../environments/constants";
import { FunctionsUtil } from "../../util/functions.util";

@IonicPage()
@Component({
    selector: 'page-signup',
    templateUrl: 'signup.html',
})
export class SignupPage {

    public signupForm: FormGroup;
    submitAttempt: boolean = false;
    uidAparelho: string;
    constructor(
        private events: Events,
        public navCtrl: NavController,
        public navParams: NavParams,
        public menu: MenuController,
        public platform: Platform,
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        public formBuilder: FormBuilder,
        public authProvider: AuthProvider,
        private logger: LoggerProvider,
        public userProvider: UserProvider,
        private modalCtrl: ModalController
    ) {

        const emailRegex = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

        this.signupForm = formBuilder.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            phone: ['', [Validators.required, Validators.minLength(11)]],
            email: ['', Validators.compose([Validators.required, Validators.pattern(emailRegex)])],
            password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
            terms: [false, Validators.compose([Validators.required])]
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
        this.events.subscribe('checked', value => {
            this.signupForm.controls['terms'].setValue(value)
        })

    }

    ionViewWillLeave() {
    }

    register() {

        if (!this.signupForm.value.terms) {
            this.showAlert('Aviso', "Você precisa aceitar os termos e condições do aplicativo Zona Azul!", "info", () => {
            });
            return;
        }

        this.signupForm.value.phone = FunctionsUtil.cleanBRMask(this.signupForm.value.phone);
        this.submitAttempt = true;

        if (this.signupForm.valid) {
            let loading = this.loadingCtrl.create({ content: 'Aguarde...' });
            loading.present();

            let user = new User(this.signupForm.value);
            user.uidAparelho = this.navParams.get('uidAparelho');
            let password = this.signupForm.value.password;

            this.authProvider.createUserAuth(user.email, password, user)
                .then((userAuth: User) => {
                    let res = { 'logged': userAuth };
                    console.log('userAuth',userAuth)
                    this.userProvider.saveUserLocal(userAuth.id).then(_ => {
                        this.logger.info('NOTIFICATION SIGNUP. User: ' + userAuth.id);
                        this.events.publish('user', user)
                        this.showPage(userAuth.id, { user: userAuth, fromPage: 'signup' });
                    })
                    /*if (userAuth) {
                        let res = { 'logged': userAuth };

                        this.modalCtrl.create(Constants.CONFIRMA_CPF_PAGE.name, { res }, { cssClass: 'modal-alert' })
                            .present()
                        this.events.subscribe('update', value => {
                            this.userProvider.updateUser(value.logged.id, { cpf: value.logged.cpf })
                                .then(__ => {

                                    this.userProvider.saveUserLocal(userAuth.id).then(_ => {
                                        this.logger.info('NOTIFICATION SIGNUP. User: ' + userAuth.id);
                                        this.showPage(userAuth.id, { user: userAuth, fromPage: 'signup' });
                                    })
                                })
                        })
                    }*/

                    loading.dismiss();

                    // this.navCtrl.setRoot(Constants.TERMS_PAGE.name, {user: userAuth, isToggle: false});
                }).catch(error => {
                    loading.dismiss();
                    this.showAlert("Aviso!", "O endereço de e-mail já está sendo usado por outra conta.", "info", () => { });
                });
        }
    }

    showPage(userId, params) {
        this.setVisibleMenu(true);
        // this.navCtrl.setRoot(Constants.ROOT_PAGE.name, params);
        this.showHome(userId, params);
    }

    showHome(userId, params) {
        this.events.publish('user:load', userId);
        this.navCtrl.setRoot(Constants.PRINCIPAL_PAGE.name, params);
    }

    showTerms() {
        this.navCtrl.push(Constants.TERMS_PAGE.name, { isToggle: false });
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

    focusInput(input) {
        input.setFocus();
    }

    setVisibleMenu(status = false) {
        this.menu.enable(status);
        this.menu.swipeEnable(status);
    }
}
