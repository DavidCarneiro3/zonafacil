import { Component, ElementRef, ViewChild } from '@angular/core'
import {
    AlertController,
    IonicPage,
    LoadingController,
    ModalController,
    NavController,
    Platform,
    ToastController,
    NavParams,
    Events,
} from 'ionic-angular'
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { LocationAccuracy } from '@ionic-native/location-accuracy'
import { SpeechRecognition } from '@ionic-native/speech-recognition'
import { Geolocation } from "@ionic-native/geolocation"
import 'rxjs/add/operator/take'

import { CadModel } from "../../models/cad"
import { EstacionarModel } from "../../models/estacionar"
import { User } from '../../models/user';

import { SetoresProvider } from "../../providers/setores/setores"
import { VeiculosProvider } from '../../providers/veiculos/veiculos'
import { AuthProvider } from "../../providers/auth/auth"
import { UserProvider } from "../../providers/user/user"
import { CadsUserProvider } from "../../providers/cads-user/cads-user"
import { ComunicacaoCentralProvider } from '../../providers/comunicacao-central/comunicacao-central';
import { ModalProvider } from '../../providers/modal/modal'
import { AreaProvider } from '../../providers/area/area'

import { Constants } from "../../environments/constants"
import { MapUtil } from "../../util/map.util"
import { FunctionsUtil } from '../../util/functions.util';
import { MyApp } from "../../app/app.component"
import { EstacionarProvider } from '../../providers/estacionar/estacionar';

declare var google: any;

@IonicPage()
@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    public static map: any;
    public static latitude: number = 0;
    public static longitude: number = 0;
    public static bounds = 0;

    @ViewChild('map') mapElement: ElementRef;
    @ViewChild('search') searcElement: ElementRef;
    @ViewChild('icon') iconElement: ElementRef;

    city: any = 'Fortaleza';
    // user: User;
    cad: CadModel;
    estacionar: EstacionarModel[] = [];
    setores: any[] = [];

    qtdCadsUser: number = 0;
    qtdCadsUSados: number = 0;

    mapUtil: MapUtil = new MapUtil();

    subscribeSetores;
    fromPage;
    user;
    allSetores: any = [];

    useID: any;

    selectOptions = {
        title: 'Cidade',
        subTitle: 'Escolha sua cidade',
        mode: 'ios'
      };
      
    constructor(
        public navCtrl: NavController,
        public platform: Platform,
        public modalCtrl: ModalController,
        public alertCtrl: AlertController,
        private toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public navParams: NavParams,
        private geolocation: Geolocation,
        private locationAccuracy: LocationAccuracy,
        private androidPermission: AndroidPermissions,
        private veiculosProvider: VeiculosProvider,
        private userProvider: UserProvider,
        private setoresProvider: SetoresProvider,
        private authProvider: AuthProvider,
        private cadsUserProvider: CadsUserProvider,
        private modalProvider: ModalProvider,
        private speechRecognition: SpeechRecognition,
        private comunicacaoCentralProvider: ComunicacaoCentralProvider,
        private areaProvider: AreaProvider,
        public events: Events,
        private estacionarProvider: EstacionarProvider) {

        this.getAllSetores()

        platform.registerBackButtonAction(() => {
            if (this.navCtrl.getActive().name == 'HomePage') {
                if (!this.modalProvider.isActive()) {

                    this.goLogoutFromHome();

                }
            }
        });
    }

    ionViewCanEnter() {
        this.checkPermission()
        this.userProvider.getUserLocal().then(userID => {
            this.fromPage = this.navParams.get('fromPage');
            if (this.fromPage == 'comprovante') {
                this.navParams.data = null;
                this.openTempoRestantePage();
            }

            if (userID) {
                return true;
            }
        });
    }

    ionViewDidLoad() {
        this.userProvider.getUserLocal().then(userID => {
            this.useID = userID;
            if (userID != null) {
                let tmpid = "3KIogxCKR8hbQJrfI80449xlvtv1";
                console.log(userID)
                this.estacionarProvider.countCadsById(userID)
                .subscribe(val => {
                   // console.log(val)
                })
                this.cadsUserProvider.findQtdCads(userID).take(1).subscribe(value => {
                    value.map(cads => {
                        if (cads.key == "qtdCadsUsados") {
                            this.qtdCadsUSados = cads.item;
                        } else {
                            this.qtdCadsUser += cads.item.qtdCads;
                        }
                    });
                });
                this.userProvider.byId(userID).take(1).subscribe((user: User) => {
                    this.user = user;
                    localStorage.setItem('userProfile', this.user.profile)
                });
            }
        });

        this.getSetores();



        this.initMap();

        setTimeout(() => {
            this.searcElement.nativeElement.addEventListener('click', () => {
                let span = document.getElementById('icon');
                let mic = document.getElementById('mic');
                mic.style.display = 'none';

                if (this.platform.is('android')) {
                    span.style.display = 'block';
                } else {
                    span.style.display = 'none';
                }

                span.addEventListener('click', () => {
                    this.searcElement.nativeElement.value = '';
                });
            });

            this.searcElement.nativeElement.addEventListener('focusout', () => {
                let span = document.getElementById('icon');
                let mic = document.getElementById('mic');

                span.style.display = 'none';

                if (this.platform.is('android')) {
                    mic.style.display = 'block';
                } else {
                    mic.style.display = 'none';
                }
            });

        }, 2000);


    }



    ionViewDidEnter() {
    }

    ionViewWillLeave() {
    }

    ionViewDidLeave() {
    }

    ionViewWillUnload() {
        if (this.subscribeSetores) this.subscribeSetores.unsubscribe();
    }

    initMap() {
        if (this.mapElement != null && this.mapElement.nativeElement != null) {
            this.mapUtil.geolocation = this.geolocation;
            this.mapUtil.locationAccuracy = this.locationAccuracy;
            this.mapUtil.alertCtrl = this.alertCtrl;
            this.mapUtil.toastCtrl = this.toastCtrl;
            HomePage.map = new google.maps.Map(this.mapElement.nativeElement, this.mapUtil.mapOptions());

            let input = document.getElementById('search');

            if (HomePage.latitude == 0 && HomePage.longitude == 0) {
                HomePage.longitude = -38.522980;
                HomePage.latitude = -3.731397;
                HomePage.map.setCenter({ lat: HomePage.latitude, lng: HomePage.longitude });

            }

            if (MyApp.MAP_LOAD) {
                if (this.platform.is('cordova')) {
                    // 
                    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
                        if (canRequest || (!canRequest && this.platform.is('ios'))) {
                            // the accuracy option will be ignored by iOS
                            this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
                                () => {
                                    var options = {
                                        enableHighAccuracy: true,
                                        timeout: 20000,
                                        maximumAge: 5000
                                    };
                                    this.geolocation.getCurrentPosition(options)
                                        .then((position) => {
                                            if (position.coords != null &&
                                                position.coords.latitude != null &&
                                                position.coords.longitude != null) {

                                                HomePage.bounds = 0;
                                                HomePage.latitude = position.coords.latitude;
                                                HomePage.longitude = position.coords.longitude;
                                                let latlng = { lat: position.coords.latitude, lng: position.coords.longitude };

                                                HomePage.map.setCenter(latlng);

                                                this.mapUtil.userLocationMarker = new google.maps.Marker({
                                                    position: latlng,
                                                    icon: {
                                                        url: "assets/icon/icon-map.svg",
                                                        scaledSize: new google.maps.Size(64, 64)
                                                    },
                                                    //map: HomePage.map
                                                });
                                                const object = this.calculaDistancia(HomePage.latitude, HomePage.longitude)
                                                object.sort((a, b) => a.distance - b.distance)
                                                this.showSetor(object[0].area, object[0].codigo);
                                            } else {
                                                this.showToast("Sinal de GPS fraco ou desligado. Para obter um melhor aproveitamento, verifique se o GPS do seu telefone está ativado");
                                                HomePage.longitude = -38.522980;
                                                HomePage.latitude = -3.731397;
                                                HomePage.map.setCenter({ lat: HomePage.latitude, lng: HomePage.longitude });
                                            }
                                        })
                                        .catch((error) => {

                                            const localizacao = this.localizacaoPadraoSemGPS();
                                            HomePage.latitude = localizacao.latitude;
                                            HomePage.longitude = localizacao.longitude;
                                            HomePage.map.setCenter({ lat: HomePage.latitude, lng: HomePage.longitude });
                                            this.showToast("Sinal de GPS fraco ou desligado. Para obter um melhor aproveitamento, verifique se o GPS do seu telefone está ativado");
                                            // console.log('error GPS', error);
                                        });
                                },
                                (error) => {
                                    this.showToast("Sinal de GPS fraco ou desligado. Para obter um melhor aproveitamento, verifique se o GPS do seu telefone está ativado");
                                }
                            );
                        } else {
                            console.log(' not can request ...........');
                        }
                    }).catch((error) => {
                        console.log('Deu erro', error);
                        const localizacao = this.localizacaoPadraoSemGPS();
                        HomePage.latitude = localizacao.latitude;
                        HomePage.longitude = localizacao.longitude;
                        HomePage.map.setCenter({ lat: HomePage.latitude, lng: HomePage.longitude });
                        this.showToast("Sinal de GPS fraco ou desligado. Para obter um melhor aproveitamento, verifique se o GPS do seu telefone está ativado");
                    });

                } else {
                    const localizacao = this.localizacaoPadraoSemGPS();
                    HomePage.latitude = localizacao.latitude;
                    HomePage.longitude = localizacao.longitude;
                    HomePage.map.setCenter({ lat: HomePage.latitude, lng: HomePage.longitude });
                }

            } else {
                if (HomePage.bounds != 0) {
                    HomePage.map.fitBounds(HomePage.bounds);
                } else {
                    HomePage.map.setCenter({ lat: HomePage.latitude, lng: HomePage.longitude });
                }
            }

            this.mapUtil.searchAddress(input);
            this.mapUtil.addYourLocationButton(HomePage.map, this.platform);
            input.onblur;
        }
    }

    localizacaoPadraoSemGPS() {
        return { latitude: -3.731397, longitude: -38.522980 };
    }



    showCloseSetor() {
        const nearSetor = this.calculaDistancia(HomePage.latitude, HomePage.longitude);
        nearSetor.sort((a, b) => a.distance - b.distance);
        this.showSetor(nearSetor[0].area, nearSetor[0].codigo);
    }

    getSetores(): void {
        this.areaProvider.getAreas().take(1).subscribe((_areas: any[]) => {

            this.subscribeSetores = this.setoresProvider.getSetoresByLocation().subscribe(value => {
                this.mapUtil.cleanPolylines();

                value.map(value => {
                    for (let key in value.setores) {
                        const _area = _areas.find(_item => _item.key === value.key);
                        this.mapUtil.addPolyline({ key: value.key, setor: value.setores[key], area: _area.area }, HomePage.map);
                    }

                    let mic = document.getElementById('mic');

                    if (this.platform.is('android')) {
                        mic.style.display = 'block';
                    } else {
                        mic.style.display = 'none';
                    }
                });
            });
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

    openEstacionarPage(event) {

        let loading = this.loadingCtrl.create({ content: 'Aguarde...' });
        loading.present();

        let button = document.getElementById('btn-show-estacionar-page');
        let codigoSetor = button.getAttribute("setor");
        let codigoArea = button.getAttribute("area");
        let nomeSetor = button.getAttribute("setor-nome");
        let nomeArea = button.getAttribute("area-nome");

        if ((this.qtdCadsUser - this.qtdCadsUSados) > 0) {

            this.userProvider.getUserLocal().then(userID => {
                this.veiculosProvider.findByUser(userID).take(1).subscribe(_item => {
                    loading.dismiss();

                    if (_item.length > 0) {
                        this.navCtrl.push(Constants.ESTACIONAR_PAGE.name, {
                            fromPage: 'mapa',
                            setor: codigoSetor,
                            area: codigoArea,
                            'setor-nome': nomeSetor,
                            'area-nome': nomeArea,
                            cad: this.cad,
                            qtdCads: (this.qtdCadsUser - this.qtdCadsUSados)
                        });
                    } else {
                        if (this.user.profile != "revendedor") {
                            this.showConditions("Olá!", "Você não possui veículos cadastrados. Deseja cadastrá-lo?",
                                "info", "Não", "Sim", () => {
                                }, () => {
                                    this.navCtrl.setRoot(Constants.VEICULOS_FORM_PAGE.name, {
                                        withMenu: true,
                                        userId: userID,
                                        fromPage: 'estacionar',
                                        area: codigoArea,
                                        setor: codigoSetor,
                                        cad: this.cad,
                                        qtdCads: (this.qtdCadsUser - this.qtdCadsUSados),
                                        veiculoAllArr: _item
                                    });
                                });
                        } else {
                            this.navCtrl.setRoot(Constants.VEICULOS_FORM_PAGE.name, {
                                withMenu: true,
                                userId: userID,
                                fromPage: 'estacionar',
                                area: codigoArea,
                                setor: codigoSetor,
                                cad: this.cad,
                                qtdCads: (this.qtdCadsUser - this.qtdCadsUSados),
                                veiculoAllArr: _item
                            });
                        }
                    }
                }, error => loading.dismiss());
            });

        } else {
            loading.dismiss();

            this.showConditions("Olá!", "Você não possui CADs no momento. Compre agora e estacione seu veículo.", "info",
                "Não", "COMPRAR", () => {
                }, () => {
                    this.navCtrl.setRoot(Constants.CREDITOS_PAGE.name, {
                        fromPage: 'estacionar',
                        area: codigoArea,
                        setor: codigoSetor,
                        qtdCads: (this.qtdCadsUser - this.qtdCadsUSados)
                    });
                });
        }
    }

    openTempoRestantePage() {
        this.navCtrl.setRoot(Constants.TEMPO_RESTANTE_PAGE.name, {
            withMenu: true
        })
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


    showAlert(title: string, msg: string, type: string, callback) {
        let alert = this.alertCtrl.create({
            title: title,
            message: msg,
            cssClass: type,
            buttons: [
                {
                    text: 'OK',
                    cssClass: 'btn-ok',
                    handler: data => {
                        callback();
                    }
                }
            ]
        });
        alert.present();
    }

    showConditions(title: string, msg: string, type: string, btnName1, btnName2, callback, callback2) {
        let alert = this.alertCtrl.create({
            title: title,
            message: msg,
            // cssClass: type,
            buttons: [
                {
                    text: btnName1,
                    cssClass: 'btn-ok',
                    handler: data => {
                        callback();
                    }
                },
                {
                    text: btnName2,
                    cssClass: 'btn-ok',
                    handler: data => {
                        callback2();
                    }
                }
            ]
        });
        alert.present();
    }

    buscarSetores() {
        let wait = this.loadingCtrl.create({ content: 'Aguarde...' });
        wait.present();
        let zonas = []
        this.userProvider.getUserLocal().then(userID => {
            if (userID) {

                this.areaProvider.getAreas().take(1).subscribe((_areas: any[]) => {

                    this.setoresProvider.getSetoresByLocation().subscribe(_setores => {

                        _setores.map(value => {
                            for (let key in value.setores) {
                                const _area = _areas.find(_item => _item.key === value.key)
                                if (_area.key == value.key) {
                                    zonas.push({ 'area': _area.area, 'setor': value.setores[key].nome, 'setorCodigo': value.setores[key].codigo })
                                }
                            }
                        })

                        wait.dismiss()
                        const setoresModal = this.modalCtrl.create(Constants.SETORES_MODAL_PAGE.name, { setores: zonas });
                        setoresModal.present().then(() => {
                            this.modalProvider.setActive();
                        })

                        setoresModal.onDidDismiss(data => {
                            if (data) {
                                const setor = String(data.setorCodigo)
                                this.showSetor(data.area, setor)
                            }
                        })
                    })
                });
            }
        })

    }
    showSetor(area: any, setor: string) {
        this.setoresProvider.byId(area.codigo, setor)
            .subscribe(data => {
                this.mapUtil.findSetor(HomePage.map, data, area);
            },
                (error) => {
                })
    }

    showStreatView() {
        /*let wait = this.loadingCtrl.create({ content: 'Aguarde...' });
        wait.present();
        let button = document.getElementById('btn-show-streat-view');
        let codigoSetor = button.getAttribute("setor");
        let codigoArea = button.getAttribute("area");

        this.setoresProvider.byId(codigoArea, codigoSetor)
            .subscribe(data => {
                const streatViewPage = this.modalCtrl.create(Constants.STREAT_VIEW_PAGE.name, { map: HomePage.map, data: data, wait: wait });
                streatViewPage.present().then(() => {
                    this.modalProvider.setActive();
                });
            },
                (error) => {
                    console.log(error);
                    wait.dismiss();
                })*/
                this.navCtrl.setRoot(Constants.PAGAMENTOS_PAGE.name)
    }

    showToast(msg: string, time?: number) {
        const toast = this.toastCtrl.create({
            message: msg,
            duration: time ? time : 6000,
            position: 'bottom'
        });
        toast.present();
    }

    goLogoutFromHome() {
        this.alertCtrl.create({
            title: 'Sair',
            message: 'Deseja sair do aplicativo?',
            cssClass: 'alert',
            buttons: [
                {
                    text: 'Sim', cssClass: 'btn btn-ok',
                    handler: () => {
                        // this.menu.close();
                        this.authProvider.logout().then(() => {
                            this.userProvider.removeUserLocal();
                            this.navCtrl.setRoot(Constants.LOGIN_PAGE.name);
                        });
                    }
                },
                {
                    text: 'Não', cssClass: 'btn btn-cancel',
                }
            ]
        }).present();
    }

    listen() {
        this.speechRecognition.requestPermission()
            .then(
                () => {
                    let options = {}
                    this.speechRecognition.startListening(options)
                        .subscribe(
                            (matches: Array<string>) => {
                                this.searcElement.nativeElement.value = matches[0];
                                this.searcElement.nativeElement.focus();
                            }, error => {
                                console.log('error', error);
                            }
                        )
                },
                () => {
                    // alert('Denied')
                    console.log('Você precisa permitir a ação de reconhecimento de voz.');
                }
            )
    }

    openHelp() {
        this.showAlert('Ajuda',
            'Para estacionar clique no ícone ou na linha verde exibido no mapa referente ao estacionamento pretendido. Será aberto uma nova tela, onde você irá confirmar seu estacionamento.'
            , '', () => { })
    }

}

export class LatLng {
    constructor(public lat: number, public lng: number) { }
}
