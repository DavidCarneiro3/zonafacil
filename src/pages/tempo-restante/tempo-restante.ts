import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController, Platform, ModalController } from 'ionic-angular'
import { EstacionarProvider } from "../../providers/estacionar/estacionar";
import { VeiculosProvider } from "../../providers/veiculos/veiculos";
import { UserProvider } from "../../providers/user/user";
import { TempoEstacionadoProvider } from './../../providers/tempo-estacionado/tempo-estacionado';
import { CadsUserProvider } from "../../providers/cads-user/cads-user";
import { VeiculoModel } from './../../models/veiculo';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/take';
import { SetoresProvider } from "../../providers/setores/setores";
import { Constants } from "../../environments/constants";
import { SetorModel } from "../../models/setor";
import { MyApp } from "../../app/app.component";
import { MapUtil } from "../../util/map.util";
import { LoggerProvider } from '../../providers/logger/logger';
import { ModalProvider } from '../../providers/modal/modal';
import { analyzeAndValidateNgModules } from '@angular/compiler';


@IonicPage()
@Component({
    selector: 'page-tempo-restante',
    templateUrl: 'tempo-restante.html',
})
export class TempoRestantePage {

    showSpinner1 = true;

    // user: User;
    loadObj = true;
    tempoCurrent = Date.now();
    _estacionados = [];
    qtdCadsUser: number = 0;
    qtdCadsUsados: number = 0;
    user_id: any;
    fromPage: string = '';
    canCancel = false;
    horaRegistro;
    perc:number;
    placa: string;
    veiculo_id: string;
    veiculo_tipo: string;
    veiculo_marca: string;
    veiculo_modelo: string;
    veiculoSelecionado: VeiculoModel;
    veiculos: any[] = []
    tempoComprado
    horario
    dataHoraRegistro
    qtd
    valor
    amc
    estacionar
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public viewCtrl: ViewController,
        private userProvider: UserProvider,
        private estacionarProvider: EstacionarProvider,
        private tempoEstacionadoProvider: TempoEstacionadoProvider,
        private veiculoProvider: VeiculosProvider,
        private setorProvider: SetoresProvider,
        private logger: LoggerProvider,
        private cadsUserProvider: CadsUserProvider,
        private alertCtrl: AlertController,
        private platform: Platform,
        private modalProvider: ModalProvider,
        private modalCtrl: ModalController) {

        MyApp.MAP_LOAD = false;
        MapUtil.circles.pop();

        // this.platform.resume.subscribe(event => {
        //     this.navCtrl.setRoot(Constants.TEMPO_RESTANTE_PAGE.name)
        // })
    }

    ionViewCanEnter() {
        this.userProvider.getUserLocal().then(userID => {
            if (userID) {
                this.user_id = userID;
                return true;
            }
        });
    }

    getVeiculo(veiculo_id, userID) {
        return this.veiculoProvider.findByVeiculo(veiculo_id, userID);
    }

    renovarEstacionar(estacionar) {
        const profile = localStorage.getItem('userProfile')
        if (!estacionar.veiculo_id || profile === 'revendedor') {
            this.navCtrl.setRoot(Constants.VEICULOS_FORM_PAGE.name, {
                withMenu: true,
                userId: this.user_id,
                fromPage: 'renovar',
                area: estacionar.area_id,
                setor: estacionar.setor_id,
                cad: 1,
                qtdCads: (this.qtdCadsUser - this.qtdCadsUsados),
                placa: estacionar.comprovante.placa,
                tipo_veiculo:estacionar.comprovante.tipo_veiculo,
                veiculo_id: estacionar.veiculo_id
            });
        } else {
           
            for (let estacionado of this._estacionados) {

                if (estacionado.estacionar.veiculo.placa == estacionar.veiculo.placa) {
                    let veiculo = {
                        key: estacionado.estacionar.veiculo_id,
                        veiculo: estacionado.estacionar.veiculo
                    }
                    this.navCtrl.setRoot(Constants.ESTACIONAR_PAGE.name, {
                        setor: estacionar.setor_id,
                        area: estacionar.area_id,
                        fromPage: 'tempo_restante',
                        cad: 1,
                        veiculo: veiculo,
                        qtdCads: (this.qtdCadsUser - this.qtdCadsUsados),
                    });
                    break;
                }
            }
        }
    }


    validaRenovar(estacionar) {
        estacionar.renovar = true;
        if (estacionar.qtd === 2) {
            estacionar.renovar = false;
        } else if (estacionar.tempoComprado === 300) {
            estacionar.renovar = false;
        }
    }

    ionViewWillEnter() {

        //atualizar tempo restante se o usuário vier de comprvante(renovação)
        let last = this.navParams.get('fromPage');
        this.fromPage = last;
        if (last) {
            if (last == 'comprovante') {
                // this.ionViewDidLoad();
            }
        }
    }



    ionViewDidLoad() {

        this.horaRegistro = Date.now();
        this.tempoEstacionadoProvider.getHoraAtualFromFirebase().then(data => {
            // console.log('now firebase: ' + JSON.stringify(data));
            // console.log('now local: ' + this.tempoCurrent);

            if(data && data.now) {
                this.tempoCurrent = data.now;
            }

            this.userProvider.getUserLocal().then(userID => {
                if (userID) {

                    this.cadsUserProvider.findQtdCads(userID).take(1).subscribe(value => {
                        value.map(cads => {
                            if (cads.key == "qtdCadsUsados") {
                                this.qtdCadsUsados = cads.item;
                            } else {
                                this.qtdCadsUser += cads.item.qtdCads;
                            }
                        });
                    });

                    this.estacionarProvider.findByUser(userID).subscribe(_values => {
                        this._estacionados = []
                        if (_values.length > 0) {
                            _values.map(_item => {
                                this.logger.info('estacionado: ' + _item.estacionar.tempoEstacionado + ' | ' + new Date(_item.estacionar.tempoEstacionado));
                                this.validaRenovar(_item.estacionar);
                                if (_item.estacionar.tempoEstacionado - this.tempoCurrent >= 0) {
                                    this._estacionados = []
                                    this.getVeiculo(_item.estacionar.veiculo_id, userID)
                                        .take(1).subscribe(_veiculo => {
                                            this.loadObj = false;
                                            this.showSpinner1 = false;
                                            _item.estacionar.veiculo = _veiculo;
                                            this.estacionar = _item.estacionar;
                                            /*this.veiculoSelecionado = _item.estacionar.veiculo;
                                            this.veiculo_id = _item.estacionar.veiculo.id;
                                            this.placa = _item.estacionar.veiculo.placa;
                                            this.veiculo_tipo = _item.estacionar.veiculo.tipo_veiculo;
                                            this.veiculo_marca = _item.estacionar.veiculo.marca;
                                            this.veiculo_modelo = _item.estacionar.veiculo.modelo;
                                            this.dataHoraRegistro = _item.estacionar.dataHoraRegistro;
                                            this.horario = _item.estacionar.comprovante.horario;
                                            this.tempoComprado = _item.estacionar.tempoComprado;
                                            this.qtd = _item.estacionar.qtd;
                                            this.valor = _item.estacionar.comprovante.valor;
                                            this.amc = _item.estacionar.comprovante.numberAuth;*/
                                            this.logger.info(_item);
                                            console.log(this.estacionar)
                                            this._estacionados.push(_item);
                                        });
                                } else {
                                    this.loadObj = false;
                                    this.showSpinner1 = false;
                                }
                            });
                            // this.loadObj = false;
                            //  this.showSpinner1 = false;
                            console.log(this._estacionados)
                        } else {
                            this.loadObj = false;
                            this.showSpinner1 = false;
                        }
                    }, error => {
                        this.showSpinner1 = false;
                        this.loadObj = false;
                    })
                }
            });
        })
    }

    openVeiculoEstacionado(obj) {
        this.setorProvider.byId(obj.estacionar.area_id, obj.estacionar.setor_id).take(1).subscribe((value: SetorModel) => {
            this.navCtrl.push(Constants.VEICULO_ESTACIONADO_PAGE.name, { lat: value.latInicio, lng: value.lngInicio });
        });
    }

    closeTempoRestantePage() {
        this.navCtrl.setRoot(Constants.PRINCIPAL_PAGE.name)
            .then(() => {
                this.modalProvider.desactivate();
            });
    }

    getImage(tipo) {
        return VeiculoModel.getImage(tipo);
    }

    selecionarVeiculo() {
        const veiculos = this._estacionados;
        console.log(veiculos)
        const veiculoModal = this.modalCtrl.create(Constants.ESTACIONADOS_MODAL_PAGE.name, { veiculos: veiculos, fromPage: "tempo_restante" });
        veiculoModal.present();

        veiculoModal.onDidDismiss(data => {
            if (data) {
                const veiculo = data
                //veiculo.estacionar.veiculo = veiculo;
                this.estacionar = veiculo.estacionar;
                this.veiculoSelecionado = veiculo.estacionar.veiculo;
                this.veiculo_id = veiculo.estacionar.veiculo.id;
                this.placa = veiculo.estacionar.veiculo.placa;
                this.veiculo_tipo = veiculo.estacionar.veiculo.tipo_veiculo;
                this.veiculo_marca = veiculo.estacionar.veiculo.marca;
                this.veiculo_modelo = veiculo.estacionar.veiculo.modelo;
                console.log(this.estacionar);
                //this._estacionados.push(veiculo);
            }
        })
    }

    getVeiculosUser(user) {
        if (user.profile == "revendedor") {
            // console.log('**********', this.veiculos);
            const _veiculo = this.navParams.get('veiculo') || null;

            if(_veiculo) {
                this.veiculos.push({ key: new Date().valueOf(), veiculo: _veiculo });
                console.log(this.veiculos)
                const _idx = this.veiculos.length-1;
                const _vTmp = this.veiculos[_idx];
                this.veiculo_id = _vTmp.veiculo.id || _vTmp.key;
                this.placa = _vTmp.veiculo.placa;
                this.veiculo_tipo = _vTmp.veiculo.tipo_veiculo;
                console.log(this.placa)
                this.veiculos[_idx].veiculo.id = this.veiculo_id
                this.veiculoSelecionado = this.veiculos[_idx].veiculo;
                
            }

            this.showSpinner1 = false;

        } else {
            if (this.fromPage) {
                if (this.fromPage === 'tempo_restante') {
                    //this.fromRenovar = true;
                    let veiculo = this.navParams.get('veiculo')

                    this.veiculo_id = veiculo.key;
                    this.placa = veiculo.veiculo.placa;
                    this.veiculoSelecionado = new VeiculoModel(veiculo.veiculo);
                    this.showSpinner1 = false;
                    // para fazer getVeiculos funcionar ... e aparecer o veiculo nas opçoes :/
                    this.veiculos.push({ key: veiculo.key, veiculo: veiculo.veiculo })

                } else {
                    this.veiculoProvider.findByUser(user.id).take(1).subscribe(value => {
                        value.forEach(item => {
                            item.veiculo.id = item.key;
                            this.veiculos.push({ key: item.key, veiculo: item.veiculo });
                        });
                        this.veiculo_id = this.veiculos[0].key;
                        this.placa = this.veiculos[0].veiculo.placa;
                        this.veiculoSelecionado = this.veiculos[0].veiculo;
                        this.showSpinner1 = false;
                    });
                    
                }
            } else {
                this.veiculoProvider.findByUser(user.id).take(1).subscribe(value => {
                    value.forEach(item => {
                        item.veiculo.id = item.key;
                        this.veiculos.push({ key: item.key, veiculo: item.veiculo });
                    });
                    this.veiculo_id = this.veiculos[0].key;
                    this.placa = this.veiculos[0].veiculo.placa;
                    this.veiculo_tipo = this.veiculos[0].veiculo.tipo_veiculo;
                    this.veiculo_marca = this.veiculos[0].veiculo.marca;
                    this.veiculo_modelo = this.veiculos[0].veiculo.modelo;
                    this.veiculoSelecionado = this.veiculos[0].veiculo;
                    console.log(this.veiculo_marca+' + '+ this.veiculo_modelo+' '+this.placa+' '+this.veiculo_tipo)
                    this.showSpinner1 = false;
                });
                
            }
        }
        
    }

    percent(time:number){
        let init: any
        let final: any
        init = new Date(time).getTime();
        final = new Date(this.tempoCurrent).getTime();
        
        var hourDiff = final - init; //in ms
        var secDiff = hourDiff / 1000; //in s
        var minDiff = hourDiff / 60 / 1000; //in minutes
        var hDiff = hourDiff / 3600 / 1000; //in hours
        var humanReadable = {hours:0,minutes:0};
        humanReadable.hours = Math.floor(hDiff);
        humanReadable.minutes = Math.floor(minDiff - 60 * humanReadable.hours);
        //console.log(date.getHours()+':'+date.getMinutes()+':'+date.getSeconds())
        time = Number(humanReadable.hours*60)+Number(humanReadable.minutes);
        //console.log(humanReadable)
        //console.log(time)
        return time
    }

    toTimestamp(horario){
        var aux = horario.split(':'), dt = new Date();
        dt.setHours(aux[0]);
        dt.setMinutes(aux[1]);
        dt.setSeconds(0);
        return dt.getTime();
      }

    somaHora(hora,minutes) {
        let minutosAdd = minutes*60*1000;
        let timeHoraFinal = this.toTimestamp(hora) + minutosAdd;
        let dt = new Date(timeHoraFinal);
        let horaRetorno = ((dt.getHours() < 10) ? '0'+dt.getHours() : dt.getHours())+':'+((dt.getMinutes()<10)? '0'+dt.getMinutes():dt.getMinutes());
        //horaRetorno += (dt.getMinutes() < 10) ? '0'+dt.getMinutes(): dt.getMinutes();
        return horaRetorno;
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
        this.showAlert('Ajuda', 'Aqui você verá seus veículos estacionados e seu tempo restante.', '', () => { })
    }
    cancelaEstacionamento(veiculo) {
        this.navCtrl.setRoot(Constants.CANCELAR_TRANSACAO_PAGE.name, {
            estacionar: JSON.stringify(veiculo.estacionar)
        })
    }

    goComprar(){
        this.navCtrl.push(Constants.CREDITOS_PAGE.name)
    }
}
