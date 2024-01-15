import { Component, ViewChild } from '@angular/core';
import {
    ActionSheetController,
    AlertController,
    LoadingController,
    IonicPage,
    ModalController,
    NavController,
    NavParams,
} from 'ionic-angular';

import { User } from "../../models/user";

import { UserProvider } from "../../providers/user/user";
import { AuthProvider } from '../../providers/auth/auth';
import { Subscription } from "rxjs/Subscription";
import { ModalProvider } from "../../providers/modal/modal";

import { MapUtil } from "../../util/map.util";
import { MyApp } from "../../app/app.component";
import { Constants } from "../../environments/constants";

@IonicPage()
@Component({
    selector: 'page-profile',
    templateUrl: 'profile.html',
})
export class ProfilePage {

    @ViewChild('fileUserPhoto') fileUserPhoto;

    public user: User = new User();

    subCurrentUser: any;
    subscription: Subscription = new Subscription();

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController,
        public actionSheetCtrl: ActionSheetController,
        public modalCtrl: ModalController,
        public modalProvider: ModalProvider,
        private userProvider: UserProvider,
        private authProvider: AuthProvider) {

        MyApp.MAP_LOAD = false;
        MapUtil.circles.pop();
    }

    ionViewCanEnter() {
        this.userProvider.getUserLocal().then(userID => {
            console.log(userID)
            if (userID) {
                return true;
            }
        });
    }


    ionViewDidLoad() {
        this.userProvider.getUserLocal().then(userID => {
            console.log(userID)
            if (userID != null) {
                
                this.subCurrentUser = this.userProvider.byId(userID).subscribe((user: User) => {
                    this.user = new User(user);
                });
            }
        });
    }

    ionViewDidEnter() { }

    ionViewWillLeave() {
        this.subscription.add(this.subCurrentUser);
        this.subscription.unsubscribe();
    }

    changePassword() {

        let loading = this.loadingCtrl.create({ content: 'Aguarde...' });
        loading.present();

        this.authProvider.sendPasswordResetEmail(this.user.email)
            .then(data => {
                console.log(data);
                loading.dismiss();
                this.showAlert('Sucesso!', 'Foi enviado um link para o seu email onde você pode alterar a sua senha.', '', {});

            }).catch(err => {

                console.log(err);
                loading.dismiss();
                this.showAlert('Ops!', 'Algo deu errado. Tente novamente mais tarde.', 'error', {});
            })
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
                    return true;
                }
            }]
        }).present();
    }

    showConfirm() {
        this.alertCtrl.create({
            title: 'Confirmação',
            message: 'Tem certeza que deseja redefinir a sua senha?',
            cssClass: 'alert',
            buttons: [
                {
                    text: 'Não', cssClass: 'btn btn-cancel',
                },
                {
                    text: 'Sim',
                    cssClass: 'btn btn-ok',
                    handler: data => {
                        this.changePassword();
                        return true;
                    }
                }
            ]
        }).present();
    }


    openPerfilEditar() {
        const profileEdit = this.modalCtrl.create(Constants.PROFILE_EDIT_PAGE.name, { user: this.user });
        profileEdit.present();
    }

}
