import { Component } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { AlertController, Events, IonicPage, LoadingController, MenuController, ModalController, NavController, NavParams, Platform } from 'ionic-angular';
import { CadModel } from '../../models/cad';
import { User } from '../../models/user';
import { AuthProvider } from '../../providers/auth/auth';
import { BrowserProvider } from '../../providers/browser/browser';
import { CadsUserProvider } from '../../providers/cads-user/cads-user';
import { CadsProvider } from '../../providers/cads/cads';
import { LoggerProvider } from '../../providers/logger/logger';
import { ModalProvider } from '../../providers/modal/modal';
import { UserProvider } from '../../providers/user/user';
import { VeiculosProvider } from '../../providers/veiculos/veiculos';
import { environment } from './../../environments/environment';
import { Geolocation } from "@ionic-native/geolocation"
import { SetoresProvider } from '../../providers/setores/setores';
import { AreaProvider } from '../../providers/area/area';
import { EstacionarPage } from '../estacionar/estacionar';
import { FunctionsUtil } from '../../util/functions.util';
import { Constants } from '../../environments/constants';
import { TempoEstacionadoProvider } from '../../providers/tempo-estacionado/tempo-estacionado';
import { EstacionarProvider } from '../../providers/estacionar/estacionar';
import { AndroidPermissions } from '@ionic-native/android-permissions';
declare var google: any;
/**
 * Generated class for the PrincipalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-principal',
  templateUrl: 'principal.html',
})
export class PrincipalPage {
    horaRegistro;
    tempoCurrent = Date.now();
    _estacionados = [];  
    loadObj = true;
    estacionar;
    city: any = 'Fortaleza';
    price: number = 0;
    cads: number = 0;
    cad = new CadModel();
    fromPage;
    area;
    setor;
    qtdCads;
    qtdCadsUser: number = 0;
    qtdCadsUsados: number = 0;
    user = new User();
    desconto = 0;
    cielo: boolean = true;
    list;
    classes: any[] = [{class1:'class1',class2:'class2',class3:'class3',class4:'class4',class5:'class5'}];
    allSetores: any = [];
    subCadsUser: any;
    name: any;
    cadsUsados: number = 0;
    setorNome: any;
    veiculo: any;
    showSpinner: boolean = true;
    lat: any;
    long: any;
    useID: any;

    selectOptions = {
        title: 'Cidade',
        subTitle: 'Escolha sua cidade',
        mode: 'ios'
      };

  constructor(
    public navCtrl: NavController,
        public navParams: NavParams,
        public alertCtrl: AlertController,
        private loadingCtrl: LoadingController,
        private estacionarProvider: EstacionarProvider,
        private androidPermission: AndroidPermissions,
        private tempoEstacionadoProvider: TempoEstacionadoProvider,
        private userProvider: UserProvider,
        private cadsUserProvider: CadsUserProvider, 
        private cadProvider: CadsProvider,
        private veiculoProvider: VeiculosProvider,
        private logger: LoggerProvider,
        private veiculosProvider: VeiculosProvider,
        private setoresProvider: SetoresProvider,
        private areaProvider: AreaProvider,
        private geolocation: Geolocation,
        public menu: MenuController,
        private modalCtrl: ModalController,
        private events: Events,
  ) {
  }

  ionViewDidLoad() {
    
    this.geolocation.getCurrentPosition().then((resp) => {
        this.lat = resp.coords.latitude
        this.long = resp.coords.longitude
        this.showSpinner = false;
        //console.log(resp.coords)
        
        //console.log(nearSetor)
        //this.navCtrl.setRoot(Constants.ESTACIONAR_PAGE.name,{area: nearSetor[0].area, codigo: nearSetor[0].codigo});
       })
    
    this.getAllSetores();
    this.carregaUsuarioComCADs();
    this.events.publish('update_saldo', 'update');

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
                    console.log(_values)
                    this._estacionados = []
                    if (_values.length > 0) {
                        console.log('aqui entrou')
                        _values.map(_item => {
                            console.log(_item)
                            this.logger.info('estacionado: ' + _item.estacionar.tempoEstacionado + ' | ' + new Date(_item.estacionar.tempoEstacionado));
                            this.validaRenovar(_item.estacionar);
                            if (_item.estacionar.tempoEstacionado - this.tempoCurrent >= 0) {
                                console.log('entrou')
                                this._estacionados = []
                                this.getVeiculo(_item.estacionar.veiculo_id, userID)
                                    .take(1).subscribe(_veiculo => {
                                        this.loadObj = false;
                                        this.showSpinner = false;
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
                                this.showSpinner = false;
                            }
                        });
                        // this.loadObj = false;
                        //  this.showSpinner1 = false;
                        console.log(this._estacionados)
                    } else {
                        this.loadObj = false;
                        this.showSpinner = false;
                    }
                }, error => {
                    this.showSpinner = false;
                    this.loadObj = false;
                })
            }
        });
    })
  }

  checaEstacionado(item){
      //console.log(this._estacionados)
    return this._estacionados.find(x => {
        if(x.estacionar.veiculo.placa == item){
            return true;
        }else{
            return false;
        }
    })
  }

    validaRenovar(estacionar) {
        estacionar.renovar = true;
        if (estacionar.qtd === 2) {
            estacionar.renovar = false;
        } else if (estacionar.tempoComprado === 300) {
            estacionar.renovar = false;
        }
    }

    getVeiculo(veiculo_id, userID) {
        return this.veiculoProvider.findByVeiculo(veiculo_id, userID);
    }

  ionViewCanEnter() {
    this.showSpinner = true;

    this.userProvider.getUserLocal().then(userID => {
        if (userID) {
            this.userProvider.byId(userID).take(1).subscribe(_user => {
                this.user = new User(_user);
                this.veiculosProvider.findByUser(this.user.id).take(1).subscribe(_data => {
                    this.list = _data;
                }); 
                // console.log(this.list)
                this.showSpinner = false;

                this.checkPermission();
                this.showPopupCpf();
            });

            return true;
        }
    });
  }

  ionViewDidEnter() {
    // console.log('ionViewDidEnter - principal')
    // this.events.publish('update_saldo', 'update');
    this.tempoCurrent = Date.now();

    this.tempoEstacionadoProvider.getHoraAtualFromFirebase().then(data => {
        // console.log('now firebase: ' + JSON.stringify(data));
        // console.log('now local: ' + this.tempoCurrent);
        
        if(data && data.now) {
            this.tempoCurrent = data.now;
        }
    });
  }

  // VERIFICA SE O APP POSSUI AUTORIZAÇÃO PARA A LEITURA DO TELEFONE E PEGA O IMEI DO CELULAR
  checkPermission() {
    this.androidPermission.checkPermission(
        this.androidPermission.PERMISSION.READ_PHONE_STATE)
        .then((result) => {
            if (!result.hasPermission) {
                const modalPermission = this.modalCtrl.create(Constants.PERMISSIONS_MODAL_PAGE.name, { fromPage: 'phone' })
                modalPermission.present().then(() => {
                    modalPermission.onWillDismiss(() => {
                        this.androidPermission.checkPermission(this.androidPermission.PERMISSION.ACESS_COARSE_LOCATION
                            && this.androidPermission.PERMISSION.ACCESS_FINE_LOCATION)
                            .then((result) => {
                                if (!(result.hasPermission)) {
                                    const modal = this.modalCtrl.create(Constants.PERMISSIONS_MODAL_PAGE.name, { fromPage: 'home-page' })
                                    modal.present()
                                }
                            })
                    })
                })

            }
            else {
                this.userProvider.updateUuidOrImei(this.useID, (uuid) => {
                })
                this.androidPermission.checkPermission(this.androidPermission.PERMISSION.ACCESS_FINE_LOCATION)
                    .then((location) => {
                        if (!location.hasPermission) {
                            const modal = this.modalCtrl.create(Constants.PERMISSIONS_MODAL_PAGE.name, { fromPage: 'home-page' })
                            modal.present()
                        }
                    })
            }
        })
        .catch(err => console.log(err))
}

askPermission() {
    const permissionModal = this.modalCtrl.create(Constants.PERMISSIONS_MODAL_PAGE.name, { fromPage: 'phone' })
    permissionModal.present()
        .then(() => { }
        )
        .catch(err => { }
        )
}

  showPopupCpf() {
    //   console.log('cpf', this.user);
      if(this.user && ((this.user.cpf === undefined) || (this.user.cpf !== undefined && this.user.cpf === "")) ) {
        this.modalCtrl.create(Constants.CONFIRMA_CPF_PAGE.name, {'user': this.user }, { cssClass: 'modal-alert' })
            .present()
      }
  }

  carregaUsuarioComCADs() {
    this.userProvider.getUserLocal().then(userID => {
        this.userProvider.byId(userID).take(1).subscribe((user: User) => {
            if (user) {
                this.user = new User(user);
                this.logger.info('user: ' + JSON.stringify(this.user));
                this.user = new User(user);
                //this.name = this.namePattern(this.user.name.toString())
                console.log(name)
                this.subCadsUser = this.cadsUserProvider.getCads(this.user.id).subscribe(value => {
                    this.cadsUsados = 0;
                    this.cads = 0;

                    value.map(value => {
                        if (value.key == "qtdCadsUsados") {
                            this.cadsUsados = value.item;
                        } else {
                            this.cads += value.item.qtdCads;
                            //this.price += (value.item.qtdCads*2);
                        }
                    });
                    this.price = (this.cads - this.cadsUsados)*2;
                });
            }
        });
    });
}
showCloseSetor(item) {
    console.log('Item',item)
    const nearSetor = this.calculaDistancia(this.lat, this.long);
        nearSetor.sort((a, b) => a.distance - b.distance);
        this.showSetor(nearSetor[0].area, nearSetor[0].codigo, item);
    //console.log(item)
    
}

/**
     * Adiciona todos os setores em uma lista , de modo a ter a coordenadas para abrir o mais próximo
     */
    getAllSetores(): void {
        this.areaProvider.getAreas().take(1).subscribe((_areas: any[]) => {
            
            this.setoresProvider.getSetoresByLocation().subscribe(_setores => {
                _setores.forEach(setor => {
                    for (var _setor in setor.setores) {
                        const area = _areas.find(item => item.area.codigo == setor.key)
                        //console.log(area.area)
                        if(area.area){}
                        const set = {
                            "area": area.area,
                            "setor": setor.setores[_setor]
                        }
                        this.allSetores.push(set)
                    }
                })
            })
        })
    }

/**
     * Calcula a distancia de um ponto indicado com todos os setores
     * @param lat latitude do ponto a ser calculado a distancia  do setor
     * @param long  longitude do ponto a ser calculado a distancia do setor
     * @returns lista de objectos contendo a distancia , area e o codigo do setor
     */
    calculaDistancia(lat, long): any[] {
        const myPosition = new LatLng(lat, long);
        let setores = [];
        this.allSetores.forEach((setor) => {

            const _setor = new LatLng(setor.setor.latInicio, setor.setor.lngInicio);
            const distance = FunctionsUtil.getDistanceBetweenPoints(myPosition, _setor, 'km').toFixed(3);

            const open = {
                "distance": `${distance}`,
                "area": setor.area,
                "codigo": setor.setor.codigo
            }
            setores.push(open);
        })
        return setores
    }

    showSetor(area: any, setor: string, veiculo: any) {
        this.setoresProvider.byId(area.codigo, setor)
            .subscribe(data => {
                //this.mapUtil.findSetor(HomePage.map, data, area);
                this.setorNome = data
                console.log(data)
                console.log('Area código: '+area.codigo)
                console.log('Area nome: '+area.endereco)
                console.log('Setor código: '+setor)
                console.log('Setor nome: '+this.setorNome.nome)
                console.log(veiculo)
                this.navCtrl.setRoot(Constants.ESTACIONAR_PAGE.name,{'area': area.codigo, 'setor': setor, 'area-nome': area.codigo, 'setor-nome': this.setorNome.nome, 'fromPage': 'principal', 'veiculo': veiculo, qtdCads: (this.cads-this.cadsUsados)});
            },
                (error) => {
                })
                //this.navCtrl.setRoot(Constants.ESTACIONAR_PAGE.name,{area};
                

    }
    
    goHome() {
        this.navCtrl.push(Constants.HOME_PAGE.name);
    }

    goTempoRest() {
        this.navCtrl.push(Constants.TEMPO_RESTANTE_PAGE.name);
        
    }

    goVeiculos(){
        this.navCtrl.push(Constants.VEICULOS_FORM_PAGE.name, { userId:this.user.id, 'veiculoAllArr': this.list })
    }
    
    goComprar(){
        this.navCtrl.push(Constants.CREDITOS_PAGE.name, {'fromPage': 'principal'})
    }


}
export class LatLng {
    constructor(public lat: number, public lng: number) { }
}