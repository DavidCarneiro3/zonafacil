import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AlertController, Events, IonicPage, LoadingController, ModalController, NavController, NavParams, ViewController } from 'ionic-angular';
import { CardIO } from '@ionic-native/card-io';

import { PagamentoModel } from './../../models/pagamento';

import { PagamentosProvider } from '../../providers/pagamentos/pagamentos';
import { UserProvider } from "../../providers/user/user";

import { MyApp } from "../../app/app.component";
import { FunctionsUtil } from "../../util/functions.util";
import { MapUtil } from "../../util/map.util";
import { Constants } from '../../environments/constants';
import { PagamentosPage } from '../pagamentos/pagamentos';

@IonicPage()
@Component({
    selector: 'page-pagamentos-form',
    templateUrl: 'pagamentos-form.html',
})
export class PagamentosFormPage {

    fromPage;
    userId;
    user;
    pgtoAllArr = [];
    itemTmp;

    @ViewChild('numero') numero;

    public formGroup: FormGroup;

    item = new PagamentoModel();
    titulo = 'Adicionar';

    dataMin: string;
    dataMax: string;

    constructor(public navCtrl: NavController, public navParams: NavParams,
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        public formBuilder: FormBuilder,
        private cardIO: CardIO,
        private userProvider: UserProvider,
        private pagamentosProvider: PagamentosProvider,
        public viewCtrl: ViewController,
        private modalCtrl: ModalController,
        private events: Events) {

        MyApp.MAP_LOAD = false;
        MapUtil.circles.pop();

        this.formGroup = formBuilder.group({
            numero: ['', Validators.compose([Validators.required])],
            data: ['', Validators.required],
            //ccv: ['', Validators.required],
            nome: ['', Validators.required],
            cpf: ['', Validators.compose([Validators.minLength(14), Validators.required])],
        });

        let dataMaxDt = new Date();
        dataMaxDt.setDate(1);
        dataMaxDt.setMonth(0);
        this.dataMin = dataMaxDt.toISOString();

        dataMaxDt = new Date();
        dataMaxDt.setFullYear(dataMaxDt.getFullYear() + 8);
        this.dataMax = dataMaxDt.toISOString();
    }

    ionViewCanEnter() {
        this.userProvider.getUserLocal().then(userID => {
            if (userID) {
                return true;
            }
        });
    }

    ionViewDidEnter() {
    }

    ionViewDidLoad() {
        this.item.data = '';
        this.fromPage = this.navParams.get('fromPage');
        this.pgtoAllArr = this.navParams.get('pgtoAllArr');
        this.itemTmp = this.navParams.get('item');
        this.user = this.navParams.get('user');
        this.userId = this.user.id;

        console.log('itemtmp', this.itemTmp)
        if (this.itemTmp) {
            this.titulo = 'Detalhes';

            const parseTmp = (typeof this.itemTmp === "string") ? JSON.parse(this.itemTmp) : this.itemTmp;
            console.log('parsetmp', parseTmp)
            this.item = new PagamentoModel(parseTmp.values);
            this.item.id = parseTmp.key;
            this.item.ccv = '';
            this.item.numero = this.item.numero.replace(/^(\d{4})\D*(\d{4})\D*(\d{4})\D*(\d{4})$/g, '$1.$2.$3.$4');
            this.item.cpf = this.item.cpf.replace(/^(\d{3})\D*(\d{3})\D*(\d{3})\D*(\d{2})$/g, '$1.$2.$3-$4');

        }
    }

    ionViewWillLeave() {
    }

    scan() {
        this.cardIO.canScan()
            .then(
                (res: boolean) => {
                    if (res) {
                        let options = {
                            requireExpiry: true,
                            requireCVV: true,
                            requirePostalCode: false,
                            requireCardholderName: true,
                            hideCardIOLogo: true,
                        };
                        let loading = this.showLoading();

                        this.cardIO.scan(options)
                            .then(data => {
                                this.item.nome = data.cardholderName;
                                this.item.numero = data.cardNumber;
                                if (data.cvv) {
                                    this.item.ccv = data.cvv;
                                }

                                if (data.expiryMonth < 10) {
                                    this.item.data = data.expiryYear + '-' + '0' + data.expiryMonth;
                                } else {
                                    this.item.data = data.expiryYear + '-' + data.expiryMonth;
                                }

                                // this.showAlert('Sucesso', 'Dados do cartão obtidos com sucesso!', 'alert', () => {
                                this.numero.setFocus();
                                loading.dismiss();
                                // });
                            }).catch(error => {
                                //this.showAlert('Ops!', JSON.stringify(error), 'error', () => {
                                loading.dismiss();
                                //});
                            })
                    }
                }
            )
            .catch(error => {
                this.showAlert('Olá', 'Você precisa autorizar a aplicação para utilizar este recurso.', '', () => { });
            })
    }

    submit() {
        if (!this.formGroup.valid) {
            this.showAlert('Aviso!', 'Preencha todos os campos do formulário para cadastrar seu cartão.', '', () => {
            });
            return;
        }

        let loading = this.showLoading();

        if (FunctionsUtil.checkCPF(this.formGroup.value.cpf)) {
            this.formGroup.value.cpf = FunctionsUtil.cleanBRMask(this.formGroup.value.cpf);
            this.formGroup.value.numero = FunctionsUtil.cleanBRMask(this.formGroup.value.numero);
            
            const _filterArr = this.pgtoAllArr.filter(_item => _item.values.numero === this.formGroup.value.numero);
            if(_filterArr && _filterArr.length > 0) {

                MyApp.showConfirm(this.alertCtrl, 'Ops', 'Seu cartão de crédito já foi inserido, deseja sobrescrevê-lo?', 
                    () => {
                        this.itemTmp = _filterArr[0];
                        this.saveOrUpdate(loading);
                    }, 
                    () => { loading.dismiss() }
                ).present();
            } else {
                this.saveOrUpdate(loading);
            }            

        } else {
            this.showAlert('Aviso!', 'Você precisa inserir um CPF válido!', '', () => loading.dismiss());
        }
    }

    private saveOrUpdate(loading) {
        if (this.itemTmp == undefined || this.itemTmp.key == '') {
            let entity = this.formGroup.value;
            let dataFormat = entity.data;
            let split = dataFormat.split('/');

            let _data = new Date();
            _data.setMonth(parseInt(split[0])-1);
            _data.setFullYear(parseInt(split[1]));

            entity.data = _data.toISOString();

            this.pagamentosProvider.save(this.userId, entity).then(() => {
                if(this.user && ((this.user.cpf === undefined) || (this.user.cpf !== undefined && this.user.cpf === "")) ) {
                    this.userProvider.updateUser(this.userId, { cpf: this.formGroup.value.cpf })
                }

                console.log('valor do form ', entity)
                loading.dismiss();
                
                if(this.fromPage === 'principal' || this.fromPage === 'estacionar') {
                    this.navCtrl.getPrevious().data.gotoPage = 'pagamento'
                }

                this.navCtrl.pop();
            }, error => {
                this.showAlert('Ops', 'Não foi possível salvar seu cartão! Verifique se os dados estão corretos.', '', () => loading.dismiss());
            });
        } else {

            let entity = this.formGroup.value;
            let dataFormat = entity.data;
            let split = dataFormat.split('/');

            let _data = new Date();
            _data.setMonth(parseInt(split[0])-1);
            _data.setFullYear(parseInt(split[1]));

            entity.data = _data.toISOString();

            this.pagamentosProvider.update(this.userId, this.itemTmp.key, entity).then(() => {
                if(this.user && ((this.user.cpf === undefined) || (this.user.cpf !== undefined && this.user.cpf === "")) ) {
                    this.userProvider.updateUser(this.userId, { cpf: entity.cpf })
                }
                
                loading.dismiss();
                this.navCtrl.pop();
            }, error => {
                this.showAlert('Ops', 'Não foi possível salvar seu cartão! Verifique se os dados estão corretos.', '', () => loading.dismiss());
            });
        }
    }

    showLoading() {
        let loading = this.loadingCtrl.create({ content: 'Aguarde...' });
        loading.present();
        return loading;
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
        }).present();
    }

    openHelp() {
        this.showAlert('Ajuda', 'Para cadastrar uma forma de pagamento, preencha todos os campos do formulário.', '', () => { })
    }

}
