import { Component } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { ViewController, IonicPage, NavParams, AlertController } from 'ionic-angular';

import { User } from '../../models/user'

import { UserProvider } from '../../providers/user/user';

@IonicPage()
@Component({
    selector: 'permissions-screen',
    templateUrl: 'permissions-screen.html'
})
export class PermissionsModalPage {

    user_id: any;
    user: any;
    fromPage: string = '';
    public title: string = '';
    public reason: string = '';



    constructor(
        private navParams: NavParams,
        public alertCtrl: AlertController,
        private userProvider: UserProvider,
        private androidPermissions: AndroidPermissions,
        private viewCtrl: ViewController
    ) { }

    ionViewWillLoad() {
        this.getPage()
    }

    ionViewCanEnter() {
        this.userProvider.getUserLocal().then(userID => {
            if (userID) {
                this.user_id = userID;
                this.userProvider.byId(userID)
                    .subscribe((user: User) => {
                        this.user = user;
                    })
                return true;
            }
        });
    }


    // PROCURAR AQUI PARA DIVIDER CADA PERMISSÃO EM UMA TELA SEPARADA
    getPage() {
        const IMEI = `O Zona Fácil precisará do seu IMEI para prosseguir. O IMEI é o identificador único do seu smartphone e ele garantirá a segurança das suas transações.`;
        const localização = `O Zona Fácil está à sua disposição em muitos bairros, e para melhor atendê-lo, gostaríamos da sua permissão para acessar a sua localização para selecionar automaticamente o bairro onde você está localizado e para informar vagas disponíveis, nos bairros onde há este serviço.`;
        const camera = `O Zona Fácil precisará acessar sua câmera ou arquivos de mídia para prosseguir. Isso porque será necessário enviar uma foto do documento.`;

        return new Promise(resolve => {
            this.fromPage = this.navParams.get('fromPage');

            if (this.fromPage == 'profile-edit') {
                this.title = 'Acesso a Câmera e Galeria!'
                this.reason = 'O Zona Fácil precisa de acesso a camera e a galeria para alterar a foto de perfil!'
            } else if (this.fromPage === 'phone') {
                this.title = 'Acesso ao Telefone';
                this.reason = IMEI;
            } else if (this.fromPage === 'pdv-empresa') {
                this.title = 'Acesso a Câmera e Galeria!'
                this.reason = camera;
            } else {
                this.title = 'Acesso a Localização!';
                this.reason = localização;
            }
            resolve(true)
        }
        )
    }

    askPermissions() {
        if (this.fromPage == 'profile-edit' || this.fromPage == 'pdv-empresa') {
            this.askCameraPermission()
        } else if (this.fromPage == 'phone') {
            this.askPhonePermision()
        } else {
            this.askLocationPermission()
        }
    }


    askCameraPermission() {
        this.androidPermissions.requestPermissions([
            this.androidPermissions.PERMISSION.CAMERA,
            this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
        ])
            .then(() => {
                this.closePage()
            })
            .catch((error) => {
            })
    }

    askPhonePermision() {
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_PHONE_STATE)
            .then((result) => {
                if (result.hasPermission) {
                    this.userProvider.updateUuidOrImei(this.user_id, (uuid) => {
                        this.user.uidAparelho = uuid;
                    });
                    this.closePage();
                } else {
                    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_PHONE_STATE)
                        .then((result) => {
                            if (result.hasPermission) {
                                this.closePage()
                            } else {
                                this.showAlert('Permissão Importante!', 'O Zona Fácil precisa de acesso ao Telefone, para obter o IMEI do dispositivo para o funcionamento do sistema.', 'alert-button-group')
                            }
                        })
                        .catch((error) => {
                        })
                }
            })
    }

    askLocationPermission() {
        this.androidPermissions.requestPermission(
            this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION)
            .then((result) => {
                this.closePage();
            })
            .catch(err => console.log(err));
    }


    askPhonePermission() {
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_PHONE_STATE)
            .then(result => {
                if (result.hasPermission) {
                    this.userProvider.updateUuidOrImei(this.user_id, (uuid) => {
                    })
                    this.closePage();
                }
            }
            )
    }
    
    closePage() {
        this.viewCtrl.dismiss()
    }

    showAlert(title: string, msg: string, type: string) {
        this.alertCtrl.create({
            title: title,
            message: msg,
            cssClass: type,
            buttons: [
                {
                    text: 'Autorizar',
                    cssClass: 'btn-ok',
                    handler: () => {
                        this.askPhonePermission()
                    }
                },
                {
                    text: 'Cancelar',
                    cssClass: 'btn-warning',
                    handler: () => {
                        this.closePage()
                    }
                }
            ]
        }).present();
    }
}