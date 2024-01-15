import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { UserProvider } from '../../providers/user/user';
import { ReportarProblemaProvider } from '../../providers/reportar-problema/reportar-problema';

import { Constants } from '../../environments/constants';

@IonicPage()
@Component({
    selector: 'page-reportar-problema',
    templateUrl: 'reportar-problema.html',
})
export class ReportarProblemaPage {

    userId;
    public formGroup: FormGroup;

    constructor(
        public navCtrl: NavController,
        private userProvider: UserProvider,
        private formBuilder: FormBuilder,
        public alertCtrl: AlertController,
        private loadingCtrl: LoadingController,
        private reProbProvider: ReportarProblemaProvider) {

        this.formGroup = this.formBuilder.group({
            subject: ['', Validators.required],
            message: ['', Validators.required],
        });
    }

    ionViewDidLoad() {
        this.userProvider.getUserLocal().then(userID => {
            if (userID != null) {
                this.userId = userID;
            }
        });
    }

    sendData() {
        let loading = this.loadingCtrl.create({ content: 'Aguarde...' });
        loading.present();

        if (!this.formGroup.valid) {
            this.showAlert('Aviso!', 'Todos os campos são obrigatórios', '', () => {
                loading.dismiss();
            });

        } else {
            this.reProbProvider.save(this.userId, this.formGroup.value).then(data => {
                console.log(data);

                this.showAlert('Obrigado', 'Recebemos sua mensagem, em breve entraremos em contato com você.', '', () => {
                    loading.dismiss();
                    this.navCtrl.setRoot(Constants.PRINCIPAL_PAGE.name);
                })

            });
        }

    }

    showAlert(title: string, message: string, type: string, callback): void {
        this.alertCtrl.create({
            title: title,
            message: message,
            cssClass: type,
            buttons: [
                {
                    text: 'OK',
                    cssClass: 'btn-ok',
                    handler: data => callback()
                }
            ]
        }).present()
    }

    openHelp() {
        this.showAlert('Ajuda', 'Envie-nos sugestões, críticas e melhorias preenchendo o formulário conforme os campos solicitados.', '', () => { })
    }

}
