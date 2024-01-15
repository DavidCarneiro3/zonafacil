// ANGULAR
import { Component } from '@angular/core';
import {
    AlertController,
    IonicPage,
    LoadingController,
    NavController,
    NavParams,
    ViewController,
    Platform,
    ModalController
} from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/take';
import { MyApp } from "../../app/app.component";

// PROVIDERS
import { TempoEstacionadoProvider } from './../../providers/tempo-estacionado/tempo-estacionado';
import { VeiculosProvider } from "../../providers/veiculos/veiculos";
import { EstacionarProvider } from "../../providers/estacionar/estacionar";
import { UserProvider } from "../../providers/user/user";
import { CadsUserProvider } from "../../providers/cads-user/cads-user";
import { SetoresProvider } from "../../providers/setores/setores";
import { HolidaysProvider } from '../../providers/holidays/holidays';
import { CadsProvider } from "../../providers/cads/cads";
import { ComunicacaoCentralProvider } from '../../providers/comunicacao-central/comunicacao-central';

// MODELS
import { User } from "../../models/user";
import { SetorModel } from "../../models/setor";
import { HorarioModel } from "../../models/horario";
import { CadModel } from "../../models/cad";
import { EstacionarModel } from "../../models/estacionar";
import { AgendarEstacionamentoModel } from '../../models/agendamento';
import { VeiculoModel } from '../../models/veiculo';

// UTILS
import { MapUtil } from "../../util/map.util";
import { DateUtil } from '../../util/date.util';
import { FunctionsUtil } from '../../util/functions.util';

// ENVIROMENT AND CONSTANTS
import { environment } from '../../environments/environment';
import { Constants } from "../../environments/constants";

declare var google: any;

@IonicPage()
@Component({
    selector: 'page-estacionar',
    templateUrl: 'estacionar.html',
})


export class EstacionarPage {

    httpOptions;
    seletor: boolean = true;
    selectOption = {
        title: 'Regra',
        subtitle: 'Escolha a regra',
        mode: 'md'
      };

    cadSelectd: number = 1;
    setor: number;
    qtdCadsUser: number = 0;
    option: string;
    check: string;
    disabledIdoso: boolean = false;
    disabledDeficientes: boolean = false;
    disabledNormal: boolean = false;
    showSpinner: boolean = true;

    horarios: HorarioModel[] = [];

    user: User;
    setorModel: SetorModel;
    cad: CadModel;
    veiculoSelecionado: VeiculoModel;

    codigoSetor: string;
    codigoArea: string;
    nomeSetor: string;
    nomeArea: string;
    placa: string;
    veiculo_id: string;
    veiculo_tipo: string;
    veiculo_marca: string;
    veiculo_modelo: string;

    veiculos: any[] = [];
    estacionar: EstacionarModel;

    cads_setor = [];
    tempoCadVeiculo: number;
    enabled: boolean = true;
    source;
    loading;
    veiculoRenovar;
    fromRenovar: boolean = false;
    latitude: string;
    longitude: string;
    radio: any = 1;

    // holidays: any = [];

    comprovanteEmail: any;

    constructor(
        public navCtrl: NavController,
        public platform: Platform,
        public alertCtrl: AlertController,
        public navParams: NavParams,
        private loadingCtrl: LoadingController,
        private comunicacaoCentralProvider: ComunicacaoCentralProvider,
        private veiculoService: VeiculosProvider,
        private tempoEstacionadoProvider: TempoEstacionadoProvider,
        private http: HttpClient,
        private estacionarProvider: EstacionarProvider,
        private userProvider: UserProvider,
        private modalCtrl: ModalController,
        private cadsUserProvider: CadsUserProvider,
        private cadProvider: CadsProvider,
        private setorProvider: SetoresProvider,
        private _holidayProvider: HolidaysProvider,
        private viewCtrl: ViewController) {
        
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded'
            }),
        };
        // this.getHolidays();
        MyApp.MAP_LOAD = false;
        MapUtil.circles.pop();

        this.codigoSetor = this.navParams.get("setor");
        this.codigoArea = this.navParams.get("area");
        this.nomeSetor = this.navParams.get("setor-nome");
        this.nomeArea = this.navParams.get("area-nome");

        this.source = this.navParams.get('fromPage');

        this.comunicacaoCentralProvider.setDMA_NTP();

        this.cadProvider.find().take(1).subscribe(item => {
            item.map(item => {
                this.cad = item.cad;
            });
        });

        this.setorProvider.byId(this.codigoArea, this.codigoSetor).take(1).subscribe((setor: SetorModel) => {
            this.setorModel = setor;
            console.log(this.setorModel)
            if (this.setorModel.total_vagas - this.setorModel.qtd_normal_estacionados <= 0) {
                this.showAlert("Aviso!", "Não há vagas convencionais disponíveis!", "alert", () => {
                    this.disabledNormal = true;
                }, () => {
                    this.disabledNormal = true;
                });
            }
            this.latitude = this.setorModel.latInicio.toString();
            this.longitude = this.setorModel.lngInicio.toString();
            this.criarMap(this.latitude,this.longitude);
            console.log(this.latitude+' + '+this.longitude);
        });
    }

    updateQtdCadsSetor() {
        this.setorProvider.getConfigQtdCadsSetor().take(1).subscribe((cads_setor: Array<any>) => {
            this.cads_setor = cads_setor;
        });
    }

    getMinutos(item) {
        let  minutos;
        
        if(this.veiculoSelecionado && this.veiculoSelecionado.tipo_veiculo == 'caminhao'){
            if(this.setorModel.cad_caminhao * item>30){
                if(this.setorModel.cad_caminhao * item == 60){
                    minutos = (this.setorModel.cad_caminhao * item)  / 60 + ' Hora';
                }else{
                    minutos = (this.setorModel.cad_caminhao * item)  / 60 + ' Horas';
                }
                
            }else{
                minutos = (this.setorModel.cad_caminhao * item) + ' Minutos';
            }
        }else{
            if(this.setorModel.cad_veiculo * item == 60){
                minutos = (this.setorModel.cad_veiculo * item)  / 60 + ' Hora';
            }else{
                minutos = (this.setorModel.cad_veiculo * item) / 60 + ' Horas';
            }
        }
        
        
        return minutos;
    }

    updateCadsAndHorarios() {
        if (this.veiculoSelecionado && this.veiculoSelecionado.tipo_veiculo == 'caminhao') {
            this.tempoCadVeiculo = this.setorModel.cad_caminhao;
            this.check = 'carga_descarga';
            this.updateQtdCadsSetor();
        } else {
            this.tempoCadVeiculo = this.setorModel.cad_veiculo;
            if (this.tempoCadVeiculo == 300) {
                this.cads_setor = [1];
            } else {
                this.updateQtdCadsSetor();
            }
        }

        let array: HorarioModel[] = [];
        for (let key in this.setorModel.horario) {
            array.push(this.setorModel.horario[key]);
        }

        this.horarios = array.sort((a, b) => (a.sequencial - b.sequencial));
    }

    ionViewCanEnter() {
        this.qtdCadsUser = this.navParams.get("qtdCads");
        console.log('qtdCads',this.qtdCadsUser)
        this.userProvider.getUserLocal().then(userID => {
            if (userID) {
                return true;
            }
        });
    }

    // onCreate
    ionViewDidLoad() {
        this.qtdCadsUser = this.navParams.get("qtdCads");
        console.log(this.qtdCadsUser)
        this.userProvider.getUserLocal().then(userID => {
            if (userID != null) {
                this.userProvider.byId(userID).take(1).subscribe((user: User) => {
                    this.user = user;
                    this.estacionarProvider.findByAreaAndSetor(this.user.id, this.codigoArea, this.codigoSetor).take(1).subscribe(value => {
                        value.map(item => {
                            if (item) {
                                this.estacionar = item.estacionar;
                            }
                        });
                    });
                    this.getVeiculosUser(this.user);
                });
                 this.updateCadsAndHorarios();
            }
        });

        this.check = 'normal';
        this.option = 'especial';
        //document.querySelector("#especial").className = 'option-text';
    }

    // Adiciona os feriados do firebase em uma lista a ser usada depois para a verificação do estacionamento 
    // getHolidays() {
    //     this._holidayProvider.listAll()
    //         .subscribe(holidays => {
    //             holidays.map(holiday => {
    //                 this.holidays.push(holiday.date)
    //             })
    //         })
    // }

    // onStart
    ionViewWillEnter() {
        const fromVeiculoForm = this.navParams.get('fromVeiculoForm') || null;
        
        if(this.user && this.user.profile === 'revendedor' && fromVeiculoForm === 'sim') {
            this.getVeiculosUser(this.user);
        }
    }

    // onResume
    ionViewDidEnter() {
    }

    // onPause
    ionViewWillLeave() {
    }

    // onStop
    ionViewDidLeave() {
    }

    // onDestroy
    ionViewWillUnload() {
    }

    addVeiculo() {
        this.navCtrl.push(Constants.VEICULOS_FORM_PAGE.name, {type: 'revendedor'});
    }

    getVeiculosUser(user) {
        if (user.profile == "revendedor") {
            // console.log('**********', this.veiculos);
            const _veiculo = this.navParams.get('veiculo') || null;
            console.log(_veiculo)
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

            this.showSpinner = false;

        } else {
            if (this.source) {
                if (this.source === 'tempo_restante' || this.source === 'principal') {
                    if(this.source === 'tempo_restante'){
                        this.fromRenovar = true;
                    }
                    
                    let veiculo = this.navParams.get('veiculo')
                    console.log(veiculo)
                    this.veiculo_id = veiculo.key;
                    this.placa = veiculo.veiculo.placa;
                    this.veiculo_marca = veiculo.veiculo.marca;
                    this.veiculo_modelo = veiculo.veiculo.modelo;
                    this.veiculo_tipo = veiculo.veiculo.tipo_veiculo;
                    console.log(this.veiculo_tipo)
                    this.veiculoSelecionado = new VeiculoModel(veiculo.veiculo);
                    this.showSpinner = false;
                    // para fazer getVeiculos funcionar ... e aparecer o veiculo nas opçoes :/
                    this.veiculos.push({ key: veiculo.key, veiculo: veiculo.veiculo })

                } else {
                    this.veiculoService.findByUser(user.id).take(1).subscribe(value => {
                        value.forEach(item => {
                            item.veiculo.id = item.key;
                            this.veiculos.push({ key: item.key, veiculo: item.veiculo });
                        });
                        this.veiculo_id = this.veiculos[0].key;
                        this.placa = this.veiculos[0].veiculo.placa;
                        this.veiculo_marca = this.veiculos[0].veiculo.marca;
                        this.veiculo_modelo = this.veiculos[0].veiculo.modelo;
                        this.veiculoSelecionado = this.veiculos[0].veiculo;
                        this.showSpinner = false;
                    });
                    this.updateCadsAndHorarios();
                }
            } else {
                this.veiculoService.findByUser(user.id).take(1).subscribe(value => {
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
                    this.showSpinner = false;
                });
                this.updateCadsAndHorarios();
            }
        }
        this.updateCadsAndHorarios();

    }

    getVeiculo(placa): any {
        for (let i = 0; i < this.veiculos.length; i++) {
            const value = this.veiculos[i];

            if (value.veiculo.placa === placa) {
                const veiculo_id = this.user.profile == 'revendedor' ? value.veiculo.id : value.key;
                return { veiculo_id: veiculo_id, veiculo: value.veiculo };
            }
        };

        return undefined;
    }


    selecionarVeiculo() {
        const veiculos = this.veiculos;
        const veiculoModal = this.modalCtrl.create(Constants.VEICULOS_MODAL_PAGE.name, { veiculos: veiculos });
        veiculoModal.present();

        veiculoModal.onDidDismiss(data => {
            if (data) {
                const veiculo = data
                this.veiculoSelecionado = veiculo.veiculo;
                this.veiculo_id = veiculo.veiculo.id;
                this.placa = veiculo.veiculo.placa;
                this.veiculo_tipo = veiculo.veiculo.tipo_veiculo;
                this.veiculo_marca = veiculo.veiculo.marca
                this.veiculo_modelo = veiculo.veiculo.modelo
                console.log(this.veiculoSelecionado);
                this.updateCadsAndHorarios();

            }

        })
    }

    escolherVeiculo() {
        const veiculos = this.veiculos;
        const veiculoModal = this.modalCtrl.create(Constants.VEICULOS_MODAL_PAGE.name, { veiculos: veiculos });
        veiculoModal.present();

        veiculoModal.onDidDismiss(data => {
            if (data) {
                const veiculo = data
                this.veiculoSelecionado = veiculo.veiculo;
                this.veiculo_id = veiculo.veiculo.id;
                this.placa = veiculo.veiculo.placa;
                this.veiculo_marca = veiculo.veiculo.marca;
                this.veiculo_modelo = veiculo.veiculo.modelo;
                this.veiculo_tipo = veiculo.veiculo.tipo_veiculo;
                console.log(this.veiculo_tipo);
                this.updateCadsAndHorarios();

            }

        })
    }

    selectCad(value) {
        this.cadSelectd = value;
        console.log(this.cadSelectd)
    }


    salvaVeiculoNaoEstacionado(cad, estacionar, tempoEstacionadoEmMilis, dataEnvio: Date) {
        console.log(cad)
        if (dataEnvio.getHours() >= 0 && dataEnvio.getHours() < 6) {
            this.loading.present()
            this.showAlert('Aviso!', 'A ativação do estacionamento será considerada apenas no próximo início do regulamento para o local! ', '',
                //CallBack quando o usuário Confirmar
                () => {
                    let estacionamentoAgendadoModel = new AgendarEstacionamentoModel();
                    estacionamentoAgendadoModel.id = this.transformingDate(new Date())
                    estacionamentoAgendadoModel.userID = this.user.id;
                    estacionamentoAgendadoModel.lat = this.setorModel.latInicio;
                    estacionamentoAgendadoModel.long = this.setorModel.latInicio;
                    estacionamentoAgendadoModel.codigoArea = estacionar.area_id;
                    estacionamentoAgendadoModel.codigoSetor = estacionar.setor_id;
                    estacionamentoAgendadoModel.placa = this.veiculoSelecionado.getPlacaNaoFormatada();
                    estacionamentoAgendadoModel.categoria = this.veiculoSelecionado.tipo_veiculo;
                    estacionamentoAgendadoModel.tempoComprado = this.tempoCadVeiculo * cad;
                    estacionamentoAgendadoModel.quantidade = estacionar.qtd;
                    estacionamentoAgendadoModel.idTransacaoDistribuidor = estacionar.idTransacaoDistribuidor;
                    estacionamentoAgendadoModel.udid_imei = this.user.uidAparelho;
                    estacionamentoAgendadoModel.veiculo_id = estacionar.veiculo_id;

                    estacionamentoAgendadoModel.time = parseInt(this.horarios[dataEnvio.getDay()].hora_inicio)
                    console.log('Uid',this.user.id)
                    this.updateQtdCadsUsados(this.user.id, estacionar.qtd);
                    this._agendarEstacionamento(estacionamentoAgendadoModel);

                    this.enabled = true;
                },
                () => { // CallBack quando o usuário cancelar 
                    this.loading.dismiss();
                    this.enabled = true;
                }, 'Confirmar');
        } else {
            this.showAlert(
                "Confirmação", 'Deseja estacionar seu veículo?', "alert", () => {

                    const now = DateUtil.getCurrenteDateFormated()
                    const data2 = DateUtil.convertDate(now);

                    if ((data2.getTime() - dataEnvio.getTime()) > ComunicacaoCentralProvider.APP_ESPERA) {
                        this.showAlert('Ops', 'Não foi possível estacionar seu veículo. Seu tempo de espera durou mais de 30 segundos. Faça o processo novamente.', '', () => { }, () => { }, '', 'OK');
                        this.loading.dismiss();
                    } else {
                        this.operacaoLinkL2(estacionar, cad, dataEnvio, (dataProcessamento, autenticacao) => {
                            console.log('Uid',this.user.id)
                            this.updateQtdCadsUsados(this.user.id, cad);

                            let estacionarModel = new EstacionarModel(estacionar);
                            estacionarModel.categoria = this.check;
                            estacionarModel.tempoEstacionado = dataProcessamento.getTime() + tempoEstacionadoEmMilis;
                            estacionarModel.dataHoraRegistro = dataProcessamento.getTime();
                            estacionarModel.codAuth = autenticacao;
                            estacionarModel.tempoComprado = this.tempoCadVeiculo * cad;

                            this.saveEstacionar(estacionarModel, this.user.id, cad, this.veiculoSelecionado);
                        })
                    }
                }, () => { this.enabled = true; this.loading.dismiss() }, 'Sim');
            this.enabled = true;
            this.enabled = true;
            this.enabled = true;
        }
    }

    salvaVeiculoJaEstacionado(_veiculoEstacionado, cad, estacionar, tempoEstacionadoEmMilis, dataEnvio: Date) {
        console.log(cad)
        _veiculoEstacionado.map(item => {

            const isVeiculoEstacionadoNesteLocal = (item &&
                item.estacionar.area_id === estacionar.area_id &&
                item.estacionar.setor_id === estacionar.setor_id);

            const renovarEstacionado = item.estacionar.veiculo_id === estacionar.veiculo_id;

            if (estacionar.qtd === 2 && renovarEstacionado) {
                this.showAlert('Olá!', 'Você só pode renovar 1 CAD, pois já se encontra estacionado.', '', () => { }, () => { this.loading.dismiss() }, '');

            } else if (item.estacionar.qtd === 2 && isVeiculoEstacionadoNesteLocal) {
                this.showAlert('Olá!', 'Você já ativou o limite total de CADs neste local, não é permitido renovar.', '', () => { }, () => { this.loading.dismiss() }, '');

            } else if (item.estacionar.tempoComprado === 300 && isVeiculoEstacionadoNesteLocal) {
                this.showAlert('Olá!', 'Não é permitido renovar CAD com tempo de estacionamento de 300 minutos.', '', () => { }, () => { this.loading.dismiss() }, '');

            } else {

               
                let _estacionarTmp = estacionar;
                let _estacionarTitle = 'Você já se encontra estacionado em outro local. Deseja estacionar neste local?';

                let tempoAnteriorEmMilis = 0;
                let qtdAnterior = 0;

                if (isVeiculoEstacionadoNesteLocal) {
                    _estacionarTmp = item.estacionar;
                    _estacionarTitle = 'Você já se encontra estacionado neste local. Deseja renovar?';

                    // TODO: REGRA ACUMULATIVA PARA ATE 2! 
                    // TODO: MELHORAR PEGAR O TEMPO DE ESTACIONAMENTO 
                    const tempoCompradoEmMilis = _estacionarTmp.comprovante.tempoComprado * 60000;
                    tempoAnteriorEmMilis = (_estacionarTmp.dataHoraRegistro + tempoCompradoEmMilis) - dataEnvio.getTime();
                    qtdAnterior = _estacionarTmp.qtd ? (_estacionarTmp.qtd + cad) : cad;

                }
                // else if(!isVeiculoEstacionadoNesteLocal && naoEstacionarEmOutroLocal){
                //     return true;
                // }

                this.showAlert(
                    "Aviso!", _estacionarTitle, "", () => {
                        const now = DateUtil.getCurrenteDateFormated()
                        const data2 = DateUtil.convertDate(now);

                        if ((data2.getTime() - dataEnvio.getTime()) > ComunicacaoCentralProvider.APP_ESPERA) {
                            this.showAlert('Ops', 'Não foi possível estacionar seu veículo. Seu tempo de espera durou mais de 30 segundos. Faça o processo novamente.', '', () => { }, () => { }, '', 'OK');
                            this.loading.dismiss();
                        }
                        
                        else {
                            this.operacaoLinkL2(estacionar, cad, dataEnvio, (dataProcessamento, autenticacao) => {
                                console.log(dataProcessamento.getTime())
                                _estacionarTmp.tempoEstacionado = (dataProcessamento.getTime() + tempoEstacionadoEmMilis + tempoAnteriorEmMilis);
                                _estacionarTmp.dataHoraRegistro = dataProcessamento.getTime();
                                _estacionarTmp.codAuth = autenticacao;


                                item.estacionar.tempoComprado = this.tempoCadVeiculo * cad;
                                item.estacionar.status = false;
                                this.saveEstacionar(item.estacionar, this.user.id, cad, this.veiculoSelecionado);
                                this.updateEstacionar(_estacionarTmp, this.user.id, cad, this.veiculoSelecionado, isVeiculoEstacionadoNesteLocal, dataProcessamento, tempoEstacionadoEmMilis, autenticacao, qtdAnterior);

                            })
                        }

                    }, () => { this.enabled = true; this.loading.dismiss() }, 'Confirmar');
            }
            this.enabled = true;
        });
    }

    openComprovante(cad, placa) {
        console.log('Cads: '+cad+', Placa: '+placa)
        const veiculo = this.getVeiculo(placa);
        this.veiculo_id = veiculo.veiculo_id;
        // this.veiculoSelecionado = this.source? new VeiculoModel(veiculo.veiculo): veiculo;
        this.enabled = false;
        this.loading = this.loadingCtrl.create({ content: 'Aguarde...' });
        this.loading.present();

        if (this.cadSelectd == 0) {
            this.showAlert('Aviso!', 'É preciso selecionar um veículo e um CAD', '', () => { }, () => { }, '');
            this.enabled = true
            this.loading.dismiss();
        } else {

            this.tempoEstacionadoProvider.getHoraAtualFromFirebase().then(data => {
                // console.log(data);

                let estacionar = new EstacionarModel({
                    id: this.transformingDate(data.dateNow),
                    area_id: this.codigoArea,
                    setor_id: this.codigoSetor,
                    veiculo_id: this.veiculo_id,
                    codAuth: "000000000",
                    face_id: 'A',
                    qtd: cad,
                    uidAparelho: this.user.uidAparelho,
                    status: true,
                });

                // else {

                // if (statusHorario === 'ok') {
                if (this.qtdCadsUser >= cad) {

                    // this.estacionarProvider.countAll().take(1).subscribe(_qtd => {
                    const _qtd = DateUtil.uniqueID();
                    estacionar.idTransacaoDistribuidor = _qtd;
                    // console.log('estacionar_qtd', _qtd);

                    // const now = FunctionsUtil.foraHorarioPadrão(new Date(), this.holidays);
                    // // const message = this._getMensagemForaHorario(now);
                    // if (message) {


                    //     this.showAlert('Atenção!', message, '', () => {

                    //         this.estacionarProvider.isVeiculoEstacionado(this.user.id, this.veiculo_id, this.user.uidAparelho, this.user.profile)
                    //             .take(1)
                    //             .subscribe(_tempData => {
                    //                 const podeEstacionar = _tempData['podeEstacionar'] && (_tempData['cadsAtivos'] + cad) <= 3;
                    //                 const _veiculoEstacionado = _tempData['lista'];


                    //                 const temVeiculoEstacionado = _veiculoEstacionado && _veiculoEstacionado.length > 0;
                    //                 const naoTemVeiculoEstacionado = _veiculoEstacionado && _veiculoEstacionado.length === 0;

                    //                 const tempoEstacionadoEmMilis = EstacionarModel.getHoraEmMilis(cad, this.tempoCadVeiculo);

                    //                 // TODO: A regra do fucnionamento aos domingos e feriados , deve funcionar apenas para os pdv

                    //                 if (this.user.profile === 'revendedor') {
                    //                     if (temVeiculoEstacionado) {
                    //                         this.salvaVeiculoJaEstacionado(_veiculoEstacionado, cad, estacionar, tempoEstacionadoEmMilis, data.dateNow)
                    //                     } else if (naoTemVeiculoEstacionado) {
                    //                         this.salvaVeiculoNaoEstacionado(cad, estacionar, tempoEstacionadoEmMilis, data.dateNow);
                    //                     }
                    //                 } else {
                    //                     if (podeEstacionar) {
                    //                         if (temVeiculoEstacionado) {
                    //                             this.salvaVeiculoJaEstacionado(_veiculoEstacionado, cad, estacionar, tempoEstacionadoEmMilis, data.dateNow);
                    //                         } else if (naoTemVeiculoEstacionado) {
                    //                             this.salvaVeiculoNaoEstacionado(cad, estacionar, tempoEstacionadoEmMilis, data.dateNow);
                    //                         }
                    //                     } else {
                    //                         this.showAlert('Atenção!', 'Você só pode ter no máximo 3 placas com CAD ativado por aparelho.', '', () => { }, () => { }, '', 'OK');
                    //                         this.loading.dismiss()
                    //                         this.enabled = true;
                    //                     }
                    //                 }

                    //             }, (error: Error) => {
                    //                 this.showAlert('Atenção!', error.message, '', () => { }, () => { }, '', 'OK');
                    //                 this.enabled = true;
                    //                 this.loading.dismiss();
                    //             });
                    //     }, () => {
                    //         this.loading.dismiss();
                    //         this.enabled = true;
                    //     });
                    // } else {
                    this.estacionarProvider.isVeiculoEstacionado(this.user.id, this.veiculo_id, this.user.uidAparelho, this.user.profile)
                        .take(1)
                        .subscribe(_tempData => {

                            const podeEstacionar = _tempData['podeEstacionar'] && (_tempData['cadsAtivos'] + cad) <= 3;
                            const _veiculoEstacionado = _tempData['lista'];


                            const temVeiculoEstacionado = _veiculoEstacionado && _veiculoEstacionado.length > 0;
                            const naoTemVeiculoEstacionado = _veiculoEstacionado && _veiculoEstacionado.length === 0;

                            const tempoEstacionadoEmMilis = EstacionarModel.getHoraEmMilis(cad, this.tempoCadVeiculo);

                            // TODO: A regra do fucnionamento aos domingos e feriados , deve funcionar apenas para os pdv?
                            if (this.user.profile === 'revendedor') {
                                if (temVeiculoEstacionado) {
                                    this.salvaVeiculoJaEstacionado(_veiculoEstacionado, cad, estacionar, tempoEstacionadoEmMilis, data.dateNow)
                                } else if (naoTemVeiculoEstacionado) {
                                    this.salvaVeiculoNaoEstacionado(cad, estacionar, tempoEstacionadoEmMilis, data.dateNow);
                                }
                            } else {
                                if (podeEstacionar) {
                                    if (temVeiculoEstacionado) {
                                        this.salvaVeiculoJaEstacionado(_veiculoEstacionado, cad, estacionar, tempoEstacionadoEmMilis, data.dateNow);
                                    } else if (naoTemVeiculoEstacionado) {
                                        this.salvaVeiculoNaoEstacionado(cad, estacionar, tempoEstacionadoEmMilis, data.dateNow);
                                    }
                                } else {
                                    this.showAlert('Atenção!', 'Você só pode ter no máximo 3 placas com CAD ativado por aparelho.', '', () => { }, () => { }, '', 'OK');
                                    this.loading.dismiss()
                                    this.enabled = true;
                                }
                            }

                        }, (error: Error) => {
                            this.showAlert('Atenção!', error.message, '', () => { }, () => { }, '', 'OK');
                            this.enabled = true;
                            this.loading.dismiss();
                        });
                    // }
                    // });
                } else {
                    this.showAlert('Saldo Insuficiente', 'Você está sem CADs. Deseja comprar CADs para estacionar seu veículo?', '',
                        () => { this.navCtrl.push(Constants.CREDITOS_PAGE.name, { fromPage: 'estacionar', setor: this.setor, area: this.nomeArea, qtdCads: this.cad }); }, () => { }, 'COMPRAR');
                    this.enabled = true;
                    this.loading.dismiss();
                }
            });
        }
    }

    operacaoLinkL2(estacionar: EstacionarModel, cad: number, dataEnvio: Date, callback = undefined) {

        if (environment.simular_l2) {
            const now = DateUtil.getCurrenteDateFormated();
            const response = { dataProcessamento: now, autenticacao: '8903907809', sucesso: 'true' }

            const dataProcessamentoStr = response['dataProcessamento'];
            const dataProcessamento = DateUtil.convertDate(dataProcessamentoStr);

            const autenticacao = response['autenticacao'];

            if (response['sucesso'] || response['sucesso'] === 'true') {
                if (callback) {

                    callback(dataProcessamento, autenticacao);
                }
            } else {
                this.loading.dismiss();
                this.showAlert('Ops', 'Não foi possível estacionar seu veículo, uma vez que essa requisição não foi autorizada pela AMC. Para mais informações entre em contato com nosso canal de atendimento.', '', () => { }, () => { }, '', 'OK');
            }
            this.enabled = true;


        } else {

            this.verificaLinkL2(estacionar, cad, this.veiculoSelecionado, this.tempoCadVeiculo, this.setorModel, dataEnvio)
                .then(response => {
                    // const response = { dataProcessamento: '2018-07-23T19:28:00', autenticacao: '8903907809', sucesso: 'true' }
                    const dataProcessamentoStr = response['dataProcessamento'];
                    const dataProcessamento = DateUtil.convertDate(dataProcessamentoStr);
                    const autenticacao = response['autenticacao'];
                    console.log(response)
                    if (response['sucesso'] || response['sucesso'] === 'true') {
                        if (callback) {

                            callback(dataProcessamento, autenticacao);
                        }
                    } else {
                        this.showAlert('Ops', 'Não foi possível estacionar seu veículo, uma vez que essa requisição não foi autorizada pela AMC. Para mais informações entre em contato com nosso canal de atendimento.', '', () => { }, () => { }, '', 'OK');
                        this.loading.dismiss();
                    }
                    this.enabled = true;

                }).catch(error => {
                    let result = error.toString();
                    result = result.split(':')[1]
                    console.log(result)
                    this.showAlert('Indisponível', result, '', () => { }, () => { }, '', 'OK');
                    this.enabled = true;
                    this.loading.dismiss();
                })

        }
    }

    verificaLinkL2(estacionar: EstacionarModel, cad: number, veiculo: VeiculoModel, tempoCadVeiculo, setor: SetorModel, dataEnvio: Date) {
        if (this.user.profile === 'revendedor') {
            return this.comunicacaoCentralProvider.desbloqueioAtivacaoPDV(estacionar.uidAparelho,
                estacionar.area_id, estacionar.setor_id, estacionar.face_id,
                setor.latInicio, setor.lngInicio, veiculo.getPlacaNaoFormatada(),
                veiculo.getTipoVeiculoID(), tempoCadVeiculo, cad, this.user.uidPDV, estacionar.idTransacaoDistribuidor, dataEnvio);

        } else {
            // return this.comunicacaoCentralProvider.desbloqueioAtivacaoApp(
            return this.comunicacaoCentralProvider.ativacaoApp(
                estacionar.uidAparelho,
                estacionar.area_id, estacionar.setor_id, estacionar.face_id,
                setor.latInicio, setor.lngInicio, veiculo.getPlacaNaoFormatada(),
                veiculo.getTipoVeiculoID(), tempoCadVeiculo, cad, estacionar.idTransacaoDistribuidor, dataEnvio);

            // return this.comunicacaoCentralProvider.consultaSaldoApp();
        }
    }

    verificaCancelamentoLinkL2(idTransacaoDistribuidor, idTransacaoDistribuidorCancelamento, dataEnvio: Date) {
        if (this.user.profile === 'revendedor') {

            return this.comunicacaoCentralProvider.cancelamentoPDV(idTransacaoDistribuidor,
                'Tempo máximo de espera de 30 (trinta) segundos excedido', parseInt(this.user.uidPDV), idTransacaoDistribuidorCancelamento, dataEnvio)
                .then(response => {
                    console.log('pdv', response);
                }).catch(err => {
                    console.log('erro')
                })

        } else {
            return this.comunicacaoCentralProvider.cancelamentoApp(idTransacaoDistribuidor,
                'Tempo máximo de espera de 30 (trinta) segundos excedido', idTransacaoDistribuidorCancelamento, dataEnvio)
                .then(response => {
                    console.log('cancelamento da AMC', response)
                })
                .catch(err => {
                    console.log(` Erro de cancelamento ${err}`);
                })
        }
    }

    saveEstacionar(estacionar: EstacionarModel, userID: string, cad: number, veiculo: VeiculoModel, fromUpdate?: boolean) {
        const date = new Date(estacionar.dataHoraRegistro);
        const comprovante = {
            isPDV: (this.user.profile === 'revendedor'),
            numberPDV: this.user.uidPDV,
            numberAuth: estacionar.codAuth,
            tempoComprado: estacionar.tempoComprado,
            data: this.transformDate(date),
            horario: this.transformHour(date),
            placa: veiculo.getPlacaNaoFormatada(),
            tipo_veiculo: veiculo.tipo_veiculo,
            valor_unitario: this.cad.valor_unitario,
            valor: (cad * this.cad.valor_unitario),
            formaPagamento: "Cartão de Crédito",
            cads: cad,
            comprovanteEmail: this.cad.info.email_comprovante,
            userEmail: this.user.email,
            userCpf: this.user.cpf,
            userFone: this.user.phone,
            endereco: this.user.endereco,
            cep: this.user.cep,
            regras: this.cad.regras_comprovante,
            site: this.cad.info.site,
            situacao: estacionar.situacao,
            distribuidorCnpj: this.cad.empresa.cnpj,
            distribuidorRazaoSocial: this.cad.empresa.razao_social,
            distribuidorNomeFantasia: this.cad.empresa.nome_fantasia,
            distribuidorEndereco: this.cad.empresa.logradouro + ', ' + this.cad.empresa.logradouro_numero,
            distribuidorCep: this.cad.empresa.cep
        };

        estacionar.comprovante = comprovante;
        this.comprovanteEmail = {
            "from": 'estacionar',
            "numberAuth": `AUTENTICAÇÃO nº${comprovante.numberAuth}`,
            "dateHour": `Data ${new Date(estacionar.dataHoraRegistro).toLocaleDateString('pt-BR')} - HORÁRIO ${new Date(estacionar.dataHoraRegistro).toLocaleTimeString('pt-BR')}`,
            "placa": `PLACA: ${comprovante.placa}`,
            "value": `VALOR: R$ ${comprovante.valor},00`,
            "cad": `CAD(s): ${comprovante.cads} de 60 MINUTOS CADA`,
            "email": `${comprovante.userEmail}`,
            "userCpf": `${comprovante.distribuidorCnpj}`,
            "userFone": `${this.cad.info.fone}`,
            "formaPagamento": `${comprovante.formaPagamento}`,
            "regras": `${comprovante.regras}`,
            "comprovanteEmail": `${comprovante.comprovanteEmail}`,
        };
        this.estacionarProvider.save(estacionar, this.user.id).then(result => {
            if (result) {
                //se n for update pode abrir comprovante, caso contrário abrira o comprovante 2x
                if (!fromUpdate) {
                    this.http.get(`https://us-central1-zonaazulfortaleza-temp.cloudfunctions.net/sendEmail?data=${JSON.stringify(this.comprovanteEmail)}`, this.httpOptions)
                        .subscribe(response => {
                            console.log(`Resposta => ${response}`)
                        }, err => console.log('Algo deu errado =>', err))
                    if (this.source) {
                        if (this.source == 'tempo_restante') {
                            this.loading.dismiss();
                            console.log('aqui')
                            this.navCtrl.setRoot(Constants.TEMPO_RESTANTE_PAGE.name, {
                                user: this.user,
                                estacionar: estacionar,
                                loading: this.loading,
                                //from: 'tempo_restante'
                            });
                            //this.viewCtrl.dismiss();

                        } else {
                            this.loading.dismiss();
                            this.navCtrl.setRoot(Constants.TEMPO_RESTANTE_PAGE.name, {
                                user: this.user,
                                estacionar: estacionar,
                                loading: this.loading
                            });
                        }
                    } else {
                        this.loading.dismiss();
                        this.navCtrl.setRoot(Constants.TEMPO_RESTANTE_PAGE.name, {
                            user: this.user,
                            estacionar: estacionar,
                            loading: this.loading
                        });
                    }
                }
            }
            else {
                this.showAlert('Erro!', 'Houve um problema ao salvar o estacionamento.', 'error', () => { }, () => { }, '');
                this.loading.dismiss();
            }
        });
    }


    updateEstacionar(estacionar: EstacionarModel, userID: string, cad: number, veiculo: VeiculoModel,
        isVeiculoEstacionadoNesteLocal: boolean, dataProcessamento, tempoEstacionadoEmMilis, autenticacao, qtdAnterior = 0) {
        this.updateQtdCadsUsados(this.user.id, cad);

        let estacionarModel = new EstacionarModel(estacionar);
        estacionarModel.id = this.transformingDate(new Date());
        estacionarModel.situacao = isVeiculoEstacionadoNesteLocal ? 'Renovação' : 'Ativação';
        estacionarModel.categoria = this.check;

        estacionarModel.tempoEstacionado = dataProcessamento.getTime() + tempoEstacionadoEmMilis;
        estacionarModel.dataHoraRegistro = dataProcessamento.getTime();
        estacionarModel.codAuth = autenticacao;

        if (qtdAnterior === 0) {
            estacionarModel.qtd = cad;
        } else {
            estacionarModel.qtd = qtdAnterior;
        }
        estacionarModel.tempoComprado = this.tempoCadVeiculo * cad;
        estacionarModel.tempoEstacionado = estacionar.tempoEstacionado;

        this.saveEstacionar(estacionarModel, this.user.id, cad, veiculo, true);
    }

    updateQtdCadsUsados(userID: string, cads: number) {
        console.log('Uid User',userID)
        console.log('item cads',cads)
        this.cadsUserProvider.getQtdCadsUsados(this.user.id).take(1).subscribe((item: string) => {
            let qtdCads = 0
            if(item !== null){
                qtdCads = parseInt(item);
            }
            console.log('item cads usados',item)
            this.cadsUserProvider.updateQtdCadsUsadas(userID, (cads + qtdCads));
        });
    }

    activateOption(event) {
        let element;
        switch (event) {
            case "regra":
                element = document.querySelector("#regra");
                element.className = "option-text";
                document.querySelector("#horarios").className = "";
                document.querySelector("#especial").className = "";
                this.option = 'regra';
                break;
            case "horarios":
                element = document.querySelector("#horarios");
                element.className = "option-text";
                document.querySelector("#regra").className = "";
                document.querySelector("#especial").className = "";
                this.option = 'horarios';
                break;
            case "especial":
                element = document.querySelector("#especial");
                element.className = "option-text";
                document.querySelector("#regra").className = "";
                document.querySelector("#horarios").className = "";
                this.option = 'especial';
                break;
        }
    }

    checkCategoria(categoria) {
        switch (categoria) {
            case 'normal':
                this.check = 'normal';
                if (this.setorModel.total_vagas - this.setorModel.qtd_normal_estacionados <= 0) {
                    this.showAlert("Aviso!", "Não há vagas convencionais disponíveis!", "info", () => {
                        this.disabledNormal = true;
                    }, () => {
                        this.disabledNormal = true;
                    }, '');
                }
                break;
            case 'deficiente':
                this.check = 'deficiente';
                if (this.setorModel.vagas_deficiente - this.setorModel.qtd_deficiente_estacionados <= 0) {
                    this.showAlert("Aviso!", "Não há vagas disponíveis para deficientes!", "info", () => {
                        this.disabledDeficientes = true;
                    }, () => {
                        this.disabledDeficientes = true;
                    }, '');
                }
                break;
            case 'idoso':
                this.check = 'idoso';
                if (this.setorModel.vagas_idoso - this.setorModel.qtd_idoso_estacionados <= 0) {
                    this.showAlert("Aviso!", "Não há vagas disponíveis para idosos!", "info", () => {
                        this.disabledIdoso = true;
                    }, () => {
                        this.disabledIdoso = true;
                    }, '');
                }
                break;
            case 'carga_descarga':
                this.check = 'carga_descarga';
                if (this.setorModel.vagas_carga_descarga - this.setorModel.qtd_carga_descarga_estacionados <= 0) {
                    this.showAlert("Aviso!", "Não há vagas disponíveis para carga/descarga!", "info", () => {
                    }, () => {
                    }, '');
                }
                break;
        }
    }

    verifyTimeEstacionar(dateCurrent: Date): string {
        switch (dateCurrent.getDay()) {
            case 0:
                return this.verifyTime(this.horarios[0], dateCurrent);
            case 1:
                return this.verifyTime(this.horarios[1], dateCurrent);
            case 2:
                return this.verifyTime(this.horarios[2], dateCurrent);
            case 3:
                return this.verifyTime(this.horarios[3], dateCurrent);
            case 4:
                return this.verifyTime(this.horarios[4], dateCurrent);
            case 5:
                return this.verifyTime(this.horarios[5], dateCurrent);
            case 6:
                return this.verifyTime(this.horarios[6], dateCurrent);
        }
    }

    private verifyTime(horario: HorarioModel, dateCurrent: Date): string {
        // console.log(horario);

        if (horario.isDisponivel) {
            const indexTmpIni = horario.hora_inicio.indexOf(":");
            const indexTmpFim = horario.hora_fim.indexOf(":");

            const hourIni = parseInt(horario.hora_inicio.substring(0, indexTmpIni));
            const hourFim = parseInt(horario.hora_fim.substring(0, indexTmpFim));

            const minuteIni = parseInt(horario.hora_inicio.substring(indexTmpIni + 1, horario.hora_inicio.length));
            const minuteFim = parseInt(horario.hora_fim.substring(indexTmpFim + 1, horario.hora_fim.length));

            // if (horario.sequencial == 6 && dateCurrent.getHours() >= 13) {
            //     return 'alerta';
            // }
            if ((dateCurrent.getHours() >= hourIni &&
                ((dateCurrent.getMinutes() <= minuteIni || dateCurrent.getMinutes() >= minuteIni) ||
                    (dateCurrent.getHours() == hourIni && dateCurrent.getMinutes() >= minuteIni))) &&
                ((dateCurrent.getHours() < hourFim &&
                    (dateCurrent.getMinutes() <= minuteFim || dateCurrent.getMinutes() >= minuteFim)) ||
                    (dateCurrent.getHours() == hourFim && dateCurrent.getMinutes() <= minuteFim))) {
                return 'ok';
            }
        }

        return 'erro';
    }

    transformingDate(date: Date) {
        let day;
        let month;
        let hour;
        let minutes;
        let seconds;

        if (date.getMonth() < 9) {
            month = "0" + (date.getMonth() + 1);
        } else {
            month = "" + (date.getMonth() + 1);
        }

        if (date.getDate() < 10) {
            day = "0" + date.getDate();
        } else {
            day = date.getDate();
        }

        if (date.getHours() < 10) {
            hour = "0" + date.getHours();
        } else {
            hour = date.getHours();
        }

        if (date.getMinutes() < 10) {
            minutes = "0" + date.getMinutes();
        } else {
            minutes = date.getMinutes();
        }

        if (date.getSeconds() < 10) {
            seconds = "0" + date.getSeconds();
        } else {
            seconds = date.getSeconds();
        }

        return date.getFullYear() + "-" + month + "-" + day + "_" + hour + "-" + minutes + "-" + seconds;
    }

    createMessage(cad): string {
        switch (cad) {
            case 1:
                return "Só é permitido escolher 1 CAD neste setor por vez.";
            case 2:
                return "Só é permitido escolher 2 CADs neste setor por vez.";
            case 3:
                return "Só é permitido escolher 3 CADs neste setor por vez.";
        }
    }

    closeEstacionarPage() {
        if (this.source) {
            if (this.source == 'tempo_restante') {
                this.navCtrl.setRoot(Constants.TEMPO_RESTANTE_PAGE.name);

            } else if (this.source == 'principal'){
                this.navCtrl.setRoot(Constants.PRINCIPAL_PAGE.name);

            } else if (this.source == 'mapa'){
                this.navCtrl.pop();
            }
        } else {
            this.navCtrl.setRoot(Constants.PRINCIPAL_PAGE.name);
        }
    }

    /**
     *  
     */
     private _agendarEstacionamento(agenda: AgendarEstacionamentoModel) {
         this.estacionarProvider.agendarEstacionamento(agenda)
             .then(response => {
                 this.showAlert('Atencão', response, '', () => {
                     this.closeEstacionarPage();
                 }, () => {
                 }, 'OK', '');
                 this.loading.dismiss();
             })
             .catch(err => {
                 this.loading.dismiss();
                 console.log(err)
             })
     }
    /**
     * 
     * @param title titulo da mensagem 
     * @param msg mensagem a ser exebida
     * @param type 
     * @param success callback a ser realizado quando o usuario confirmar
     * @param error callBack a ser executado quando o usurario clicar em cancelar
     * @param btnOk  mensagem no botão a ser exibida para confirmar, se não definido aparece o default "Confirmar"
     * @param btnCancelar  - opicionaal texto no botão a ser exebida para cancelar , caso não apareça vem o default "Cancelar"
     */
    showAlert(title: string, msg: string, type: string, success, error, btnOk = "Confirmar", btnCancelar = 'Cancelar') {

        const okBtn = {
            text: btnOk,
            cssClass: 'btn-ok',
            handler: data => {
                success();
            }
        };

        const cancelBtn = {
            text: btnCancelar,
            cssClass: 'btn-cancel',
            handler: data => {
                error();
            }
        };

        const btns = [];

        btns.push(cancelBtn);

        if (btnOk !== '')
            btns.push(okBtn);


        let alert = this.alertCtrl.create({
            title: title,
            message: msg,
            cssClass: 'alert',
            buttons: btns,
            enableBackdropDismiss: false

        });
        alert.present();
    }

    private transformDate(date: Date) {
        return date.toLocaleDateString("pt-BR");
    }

    private transformHour(date: Date) {
        return date.toLocaleTimeString("pt-BR");
    }

    // private _getMensagemForaHorario(day: string): string {
    //     switch (day) {
    //         case 'Domingo':
    //             return 'Apenas alguns locais funcionam como Zona Azul no Domingo e feriados! Confira a sinalização!'
    //         case 'Sexta':
    //             return 'Apenas alguns locais funcionam como Zona Azul após 19h! Confira a sinalização!'
    //         case 'Sabado':
    //             return 'Apenas alguns locais funcionam como Zona Azul nos Sabádos após as 14h! Confira a sinalização!'
    //         default:
    //             return ''
    //     }
    // }

    showHelp(title: string, message: string, type: string, callback): void {
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

    /**
     * Pop-out com as ajudas sobre as informações para o  usuário
     */
    //openHelp() {
       // this.showHelp('Ajuda', 'Verifique se os dados estão corretos e confirme o setor que deseja estacionar.', '', () => { })
    //}

    comprarCads(){
        this.navCtrl.push(Constants.CREDITOS_PAGE.name,{fromPage: 'estacionar'});
    }

   criarMap(lat,lon){
       
       let position = new google.maps.LatLng(lat,lon);
    function initialize() {
        var mapOptions = {
          zoom: 16,
          center: new google.maps.LatLng(lat+30,lon+30),
          panControl: false,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          overviewMapControl: false,
          rotateControl: false,
          zoomControl: false,
          disableDefaultUI: true
        };
        var map = new google.maps.Map(document.getElementById('googleMap'),
            mapOptions);
        var marker = new google.maps.Marker({
          position: position,
          animation:google.maps.Animation.BOUNCE,
          icon: {
              url: 'assets/icones/pin-yellow.svg',
              scaledSize: new google.maps.Size(55, 55),  
            },
          
          map: map
        });
      }
      google.maps.event.addDomListener(window, 'load', initialize());
   }

   checkRadio(radio){
       this.radio = radio;
       this.selectCad(radio)
       console.log(this.radio)
   }
}
