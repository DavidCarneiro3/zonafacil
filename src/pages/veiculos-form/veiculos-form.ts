import { Component } from '@angular/core';
import { AlertController, IonicPage, LoadingController, NavController, NavParams, Platform } from 'ionic-angular';
import { VeiculoModel } from '../../models/veiculo';
import { VeiculosProvider } from '../../providers/veiculos/veiculos';
import { UserProvider } from "../../providers/user/user";
import { User } from "../../models/user";
import { Constants } from '../../environments/constants';
import { MyApp } from "../../app/app.component";
import { MapUtil } from "../../util/map.util";
import { LoggerProvider } from '../../providers/logger/logger';

@IonicPage()
@Component({
    selector: 'page-veiculos-form',
    templateUrl: 'veiculos-form.html',
})
export class VeiculosFormPage {

    veiculoAllArr;
    userId;
    fromPage;
    area;
    setor;
    cad;
    qtdCads;
    withMenu = false;
    radio = 'Carro';
    radiop = 'Padrão'
    item = new VeiculoModel({ marca: ' ', modelo: ' ', tipo_veiculo: 'automovel', tipo_placa: 'padrao'});
    titulo = 'Cadastrar Veículos';
    tipos_veiculo = [];
    isPDV = false;
    typeTmp;

   
    constructor(public navCtrl: NavController, public navParams: NavParams,
        public platform: Platform,
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        private userProvider: UserProvider,
        private logger: LoggerProvider,
        private veiculosProvider: VeiculosProvider) {

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

    ionViewDidEnter() {
        this.veiculosProvider.getTiposVeiculo().take(1).subscribe(items => {
            items.forEach(item => {
                this.tipos_veiculo.push(item.tipo);
            });
        });
    }

    ionViewDidLoad() {
        this.typeTmp = this.navParams.get('type');
        const itemTmp = this.navParams.get('item');
        const withMenu = this.navParams.get('withMenu');
        this.userId = this.navParams.get('userId');
        this.fromPage = this.navParams.get('fromPage');
        this.veiculoAllArr = this.navParams.get('veiculoAllArr');

        if(!this.veiculoAllArr) {
            let loading = this.showLoading();
            this.veiculosProvider.findByUser(this.userId).take(1).subscribe(_data => {
                this.veiculoAllArr = _data;
                loading.dismiss();
            });
        }

        if (this.fromPage == 'estacionar') {
            this.area = this.navParams.get('area');
            this.setor = this.navParams.get('setor');
            this.cad = this.navParams.get('cad');
            this.qtdCads = this.navParams.get('qtdCads');
            this.item.placa = this.navParams.get('placa') ?
                this.navParams.get('placa').substring(0, 3) + '-' + this.navParams.get('placa').substring(3) : '';
        }
        
        if(this.fromPage == 'renovar'){
            this.area = this.navParams.get('area');
            this.setor = this.navParams.get('setor');
            this.cad = this.navParams.get('cad');
            this.qtdCads = this.navParams.get('qtdCads');
            this.item.placa = this.navParams.get('placa') ?
            this.navParams.get('placa').substring(0, 3) + '-' + this.navParams.get('placa').substring(3) : '';
            this.item.tipo_veiculo = this.navParams.get('tipo_veiculo')
            

        }

        if (withMenu) {
            this.withMenu = true;
        }

        if (itemTmp) {
            this.titulo = 'Detalhes';

            const parseTmp = (typeof itemTmp === "string") ? JSON.parse(itemTmp) : itemTmp;
            this.item = new VeiculoModel(parseTmp.veiculo);
            this.item.id = parseTmp.key;
            this.logger.info('user: ' + this.userId);
            this.logger.info('veiculo: ' + JSON.stringify(this.item));
            console.log(this.item)
        }
       

        this.userProvider.byId(this.userId).take(1).subscribe((item: User) => {
            if (item.profile === 'revendedor') {
                this.isPDV = true;
            }
        }, error => {
            console.error(error);
        });
        console.log(this.item)

    }

    ionViewWillLeave() { }

    formatPlaca(placa) {

        if (placa.length <= 3) {
            placa = placa.replace(/[^a-zA-Z]/g, "");
        }

        if (placa.length === 3) {
            placa = placa + "-";
        }

        if (placa.length === 5) {
            placa = placa.substr(0, 3) + '-' + placa.substr(4).replace(/[^0-9]{1}/g, "");
        }

        if (placa.length === 6) {
            placa = placa.substr(0, 5) + placa.substr(5).replace(/[^a-zA-Z]{1}[^0-9]{1}/g, "");
        }

        if (placa.length === 7) {
            placa = placa.substr(0, 6) + placa.substr(6).replace(/[^0-9]{1}/g, "");
        }
        if (placa.length === 8) {
            placa = placa.substr(0, 7) + placa.substr(7).replace(/[^0-9]{1}/g, "");
        }

        return placa;
    }

    /**
     * RegEx que valida o label para mostrar a mensagem se é ou não MERCOSUL
     * @returns true se a placa for do estilo mercosul , false caso contrario
     */
    isMercosul(): boolean {
        const regexPlacaMercosul = /^[a-zA-Z]{3}[-]{1}[0-9]{1}[a-zA-Z]{1}[0-9]{2}$/;
        return regexPlacaMercosul.test(this.item.placa)
    }

    defineTipo(tipo) {
        this.item.tipo_veiculo = tipo;
        console.log(this.item.tipo_veiculo)
    }


    submit() {
        const letters = /^[A-Za-z]+$/;
        const numbers = /^[0-9]+$/;

        if (this.item.placa.substr(0, 3).match(letters) &&
            this.item.placa.charAt(3) === '-' &&
            this.item.placa.charAt(4).match(numbers) &&
            (this.item.placa.charAt(5).match(numbers) || this.item.placa.charAt(5).match(letters)) &&
            this.item.placa.charAt(6).match(numbers) &&
            this.item.placa.charAt(7).match(numbers) &&
            this.item.placa.substr(4).length === 4) {

                const _filterArr = this.veiculoAllArr.filter(_item => _item.veiculo.placa === this.item.placa);
                if(_filterArr && _filterArr.length > 0) {

                    MyApp.showConfirm(this.alertCtrl, 'Ops', 'Seu veículo já foi inserido, deseja sobrescrevê-lo?', 
                        () => {
                            this.item.id = _filterArr[0].key;
                            this.saveVeiculo();
                        }
                    ).present();
                } else {
                    this.saveVeiculo();
                }  

        } else {
            this.showAlert('Aviso', 'Insira uma placa válida! Exemplo: ABC-0001 ou ABC-0A01', '', () => { });
        }
    }

    private saveVeiculo() {
        let loading = this.showLoading();

        if(this.typeTmp && this.typeTmp === 'revendedor') {
            loading.dismiss();
            this.navCtrl.getPrevious().data.veiculo = this.item;
            this.navCtrl.getPrevious().data.fromVeiculoForm = 'sim';
            this.navCtrl.pop();
        } else {
            if (this.isPDV) {
                this.item.id = this.navParams.get('veiculo_id');
                loading.dismiss();
                this.close();
            } else {
                if (this.item.id || '') {
                    this.veiculosProvider.update(this.userId, this.item).then(_ => {
                        loading.dismiss();
                        this.close();
                    })
                        .catch(err => {
                            loading.dismiss();
                            this.close();
                        });

                } else {
                    this.veiculosProvider.save(this.userId, this.item).then(_ => {
                        console.log(this.item)
                        loading.dismiss();
                        this.close();
                    }, reject => {
                        this.showAlert('Aviso', 'Não foi possivel salvar o seu veiculo. Por Favor tente novamente!', 'error', () => { })
                        loading.dismiss()
                    });
                }
            }
        }
    }

    close() {
        if (this.withMenu) {
            if (this.fromPage == 'estacionar' || this.fromPage == 'renovar') {
                this.navCtrl.setRoot(Constants.ESTACIONAR_PAGE.name, {
                    fromPage: 'veiculos-form',
                    setor: this.setor,
                    area: this.area,
                    cad: this.cad,
                    qtdCads: this.qtdCads,
                    veiculo: this.isPDV ? this.item : null
                });
            } else {
                this.navCtrl.setRoot(Constants.PRINCIPAL_PAGE.name);
            }
        } else {

            this.navCtrl.pop();
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

    hasId(id) {
        if (id && id !== '') {
            return true;
        }

        return false;
    }

    /**
     * Abre uma mensagem de ajuda ao úsuario com intenção de o ajudar a preencher os dados 
     */
    openHelp(): void {
        this.showAlert('Ajuda', 'Para cadastrar um veículo, preencha o formulário conforme os campos solicitados.', '', () => { })
    }

    checkRadio(radio){
        this.radio = radio;
        console.log(this.radiop)
    }

    checkRadiop(radio){
        this.item.tipo_placa = radio;
        console.log(this.item.tipo_placa)
    }

}
