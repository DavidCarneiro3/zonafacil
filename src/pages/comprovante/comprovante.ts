import { Component } from '@angular/core';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener'
import {
    IonicPage,
    NavController, NavParams, Platform, LoadingController
} from 'ionic-angular';
import { Clipboard } from '@ionic-native/clipboard';
import { SocialSharing } from '@ionic-native/social-sharing';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as pdfmake from 'pdfmake/build/pdfmake';

import { User } from "../../models/user";
import { EstacionarModel } from '../../models/estacionar';

import { UserProvider } from "../../providers/user/user";

import { MyApp } from "../../app/app.component";
import { PDFUtil } from "../../util/pdf.util";
import { MapUtil } from "../../util/map.util";
import { Constants } from "../../environments/constants";


@IonicPage()
@Component({
    selector: 'page-comprovante',
    templateUrl: 'comprovante.html',
})
export class ComprovantePage {

    cad: number;
    placa: string;
    estacionar = new EstacionarModel();
    date: Date;
    valor_unitario: number;
    codAuth: string;
    codPDV: string;
    endereco: string;
    user: User;
    situacao: string;
    comprovante: any;
    loading: any;
    source;
    showCloseButton = true;
    showSpinner: boolean = true
    forceDownload = true;
    path: string;
    pathObj;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public platform: Platform,
        public file: File,
        private clipBoard: Clipboard,
        private _fileOpener: FileOpener,
        private userProvider: UserProvider,
        private socialSharing: SocialSharing,
        private loadingCtrl: LoadingController) {

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
        this.source = this.navParams.get('from');
        this.loading = this.navParams.get('loading');
        this.user = this.navParams.get('user');
        this.estacionar = this.navParams.get('estacionar');

        this.showCloseButton = this.source === 'historico' ? false : true

        const forceDownload = this.navParams.get('forceDownload');
        this.forceDownload = forceDownload !== undefined ? forceDownload : this.forceDownload;

        if (this.loading !== undefined)
        this.showSpinner = false

        if (this.estacionar && this.estacionar.dataHoraRegistro) {
            this.date = new Date(this.estacionar.dataHoraRegistro);
            this.comprovante = this.estacionar.comprovante;

            this.cad = this.comprovante.cads;
            this.placa = this.comprovante.placa;
            this.valor_unitario = this.comprovante.valor_unitario;
            this.codAuth = this.comprovante.numberAuth;
            this.codPDV = this.comprovante.numberPDV;
            this.endereco = this.comprovante.endereco;
            this.situacao = this.estacionar.situacao
        }

        let download = this.comprovante;
        if (this.user.profile === 'revendedor')
            if (this.forceDownload) {
                this.makePDF(this.comprovante);
            }
        this.makePDF(this.comprovante);
    }

    ionViewWillLeave() {
    }

    closePageComprovante() {
        if (this.source) {
            if (this.source === 'tempo_restante') {
                this.navCtrl.setRoot(Constants.PRINCIPAL_PAGE.name, { fromPage: 'comprovante' })
            } else {
                this.navCtrl.pop();
            }
        } else {
            this.navCtrl.setRoot(Constants.PRINCIPAL_PAGE.name, { fromPage: 'comprovante' });
        }
    }

    closeEstacionarPage() {
        this.navCtrl.setRoot(Constants.PRINCIPAL_PAGE.name);
    }

    makePDF(comprovante) {
        pdfmake.vfs = pdfFonts.pdfMake.vfs;
        const filename = this.codAuth + ".pdf"
        const fileDirectory = this.platform.is('android') ? this.file.externalCacheDirectory : this.file.syncedDataDirectory

        if (this.platform.is('cordova')) {
            pdfmake.createPdf(PDFUtil.gerarPDF(comprovante,this.situacao)).getBuffer(buffer => {
                const binaryArray = new Uint8Array(buffer).buffer;
                this.file.writeFile(fileDirectory, filename, binaryArray, { replace: true })
                    .then((fileEntery) => {
                        this.path = fileEntery.toURL();
                    }).catch((err) => {
                    })
            });
        } else {
            this.pathObj = pdfmake.createPdf(PDFUtil.gerarPDF(comprovante,this.situacao))
        }
    }


    /**
     * Gera um pdf, faz download e copia o caminho para aonde foi baixado
     */
    baixarPDF() {
        if (this.platform.is('cordova')) {
            const makingPDF = this.loadingCtrl.create({ content: `Gerando PDF! Aguarde...` })
            makingPDF.present();
            this.clipBoard.clear();

            this._fileOpener.open(this.path, 'application/pdf')
                .then(() => {
                    makingPDF.dismiss()
                })
                .catch(err => {
                    alert(err)
                    makingPDF.dismiss();
                })

        } else {
            const filename = this.codAuth + ".pdf"
            this.pathObj.download(filename)
        }
    }
    /**
     * Pega o comprovante que foi gerado e partilha via rede Social
     */
    compartilhar() {
        if (this.platform.is('cordova')) {
            let loading = this.loadingCtrl.create({ content: 'Aguarde...' });
            loading.present();
            const message = 'Comprovante de estacionamento do Zona Fácil.';

            this.socialSharing.share(message, null, this.path, null)
                .then(() => {
                    loading.dismiss();
                })
                .catch(() => {

                });
        }
    }
}
