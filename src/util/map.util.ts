import { HomePage } from "../pages/home/home";
import { SetorModel } from "../models/setor";
import { Constants } from "../environments/constants";
import { getHostElement } from "@angular/core/src/render3";

declare var google: any;

export class MapUtil {

    static polylines: any[] = [];
    static infoWindows: any[] = [];
    static circles: any[] = [];
    geolocation;
    locationAccuracy;
    alertCtrl;
    toastCtrl;
    userLocationMarker: any;

    // constructor(private locationAccuracy: LocationAccuracy) { }

    public mapOptions() {
        return {
            zoom: 17,
            mapTypeControl: false,
            clickableIcons: false,
            fullscreenControl: false,
            zoomControl: false,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_BOTTOM
            },
            streetViewControl: false,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.RIGHT_BOTTOM
            },
            styles: this.getStyles()['hide']
        };
    }

    getStyles() {
        return {
            default: null,
            hide: [
                {
                    featureType: 'poi.business',
                    stylers: [{ visibility: 'off' }]
                },
                {
                    featureType: 'transit',
                    elementType: 'labels.icon',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        };
    }

    public searchAddress(input) {
        if (input) {
            // https://maps.googleapis.com/maps/api/geocode/json?address=Brazil
            // https://maps.googleapis.com/maps/api/geocode/json?address=Fortaleza
            // https://console.firebase.google.com/u/0/project/zonaazulfortaleza-temp/database/zonaazulfortaleza-temp/data/cads/ce/fortaleza/2018/ABY1x0M2qQgUhhXze1fqQ937JbG22/bounds
            const sw = new google.maps.LatLng(-3.8881764, -38.6365725);
            const ne = new google.maps.LatLng(-3.692025, -38.4013209);

            // pesquisar apenas numa regiao especifica
            const defaultBounds = new google.maps.LatLngBounds(sw, ne);

            let searchBox = new google.maps.places.SearchBox(input, { types: ['(cities)'], bounds: defaultBounds });

            HomePage.map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

            searchBox.addListener('places_changed', function () {
                let places = searchBox.getPlaces();

                if (places.length == 0) {
                    return;
                }

                let bounds = new google.maps.LatLngBounds();

                places.forEach(function (place) {
                    if (!place.geometry) {
                        console.log("Returned place contains no geometry");
                        return;
                    }
                    if (place.geometry.viewport) {
                        // Only geocodes have viewport.
                        bounds.union(place.geometry.viewport);
                        HomePage.map.setZoom(25);
                        HomePage.bounds = bounds;
                        MapUtil.circles.pop();
                    } else {
                        bounds.extend(place.geometry.location);
                        HomePage.latitude = place.geometry.location.lat;
                        HomePage.longitude = place.geometry.location.lng;
                        MapUtil.circles.pop();
                        HomePage.map.setZoom(25);
                    }
                });
                HomePage.map.fitBounds(bounds);
            });
        }
    }

    public addPolyline(item: any, map: any) {
        if (item != null && item.setor != null) {

            let polyline;
            let marker;
            let iconUrlGrenn = "assets/imgs/map-marker-blue-4.svg";
            let iconUrlRed = "assets/imgs/map-marker-red-4.svg";
            let totalVagasUtilizadas = item.setor.qtd_deficiente_estacionados + item.setor.qtd_idoso_estacionados + item.setor.qtd_normal_estacionados;

            //polyline = new google.maps.Polyline(this.createPolylineOptions(item.setor, totalVagasUtilizadas));
            //polyline.setMap(map);
            //MapUtil.polylines.push(polyline);

            marker = new google.maps.Marker({
                position: { lat: item.setor.latInicio, lng: item.setor.lngInicio },
                icon: {
                    url: (item.setor.total_vagas - totalVagasUtilizadas > 0) ? iconUrlGrenn : iconUrlRed,
                    scaledSize: new google.maps.Size(122, 122)
                }
            });
            // marker.
            marker.setMap(map);
            let infowindow = new google.maps.InfoWindow({
                content: this.createInfoPolylines(item.setor, item.area, totalVagasUtilizadas),
            });

            /**
             * Abre as opções do estacionamento
             * polyline  item pressionado onde vai abrir o evento ( linha do inicio e final do Simbolo do carro) 
             
            google.maps.event.addListener(polyline, 'click', event => {

                infowindow.setPosition(event.latLng);
                infowindow.open(HomePage.map);
                MapUtil.infoWindows.push(infowindow);

                if (MapUtil.infoWindows.length > 1) {
                    MapUtil.infoWindows.forEach(value => {
                        if (value != infowindow) {
                            value.close();
                        }
                    })
                }
            });

            
             * Abre as opções do estacionamento
             * marker  item pressionado onde vai abrir o evento ( Simbolo do carro verde) 
             */
            google.maps.event.addListener(marker, 'click', event => {
                // let latLng = event.latLng;
                let latLng = marker.position;
                console.log('marker', marker);
                console.log('event', event);

                infowindow.setPosition(latLng);
                infowindow.open(HomePage.map);
                MapUtil.infoWindows.push(infowindow);

                if (MapUtil.infoWindows.length > 1) {
                    MapUtil.infoWindows.forEach(value => {
                        if (value != infowindow) {
                            value.close();
                        }
                    })
                }

            });
        }
    }

    findSetor(map: any, setor: any, area: string) {

        const iconUrlGrenn = "assets/imgs/map-marker-blue-4.svg";
        const iconUrlRed = "assets/imgs/map-marker-red-4.svg";
        let marker;
        const latlng = new google.maps.LatLng(setor.latInicio, setor.lngInicio);
        map.setCenter(latlng);
        map.setZoom(17);

        let totalVagasUtilizadas = setor.qtd_deficiente_estacionados + setor.qtd_idoso_estacionados + setor.qtd_normal_estacionados;
        let infowindow = new google.maps.InfoWindow({
            content: this.createInfoPolylines(setor, area, totalVagasUtilizadas),
        });

        google.maps.event.addListener(infowindow, 'domready', function() {

   // Referência ao DIV que recebe o conteúdo da infowindow recorrendo ao jQuery
   //var iwOuter = this.getElementByClassName('.gm-style-iw');

   /* Uma vez que o div pretendido está numa posição anterior ao div .gm-style-iw.
    * Recorremos ao jQuery e criamos uma variável iwBackground,
    * e aproveitamos a referência já existente do .gm-style-iw para obter o div anterior com .prev().
    */
   //var iwBackground = iwOuter.prev();

   // Remover o div da sombra do fundo
   //iwBackground.children(':nth-child(2)').css({'display' : 'none'});

   // Remover o div de fundo branco
   //iwBackground.children(':nth-child(4)').css({'display' : 'none'});

});

        marker = new google.maps.Marker({
            position: { lat: setor.latInicio, lng: setor.lngInicio },
            icon: {
                url: (setor.total_vagas - totalVagasUtilizadas > 0) ? iconUrlGrenn : iconUrlRed,
                scaledSize: new google.maps.Size(32, 32)
            }
        });
        marker.setMap(map);

        infowindow.setPosition(latlng);
        infowindow.open(map, marker);
        MapUtil.infoWindows.push(infowindow);

        if (MapUtil.infoWindows.length > 1) {
            MapUtil.infoWindows.forEach(value => {
                if (value != infowindow) {
                    value.close();
                }
            })
        }

    }

    findArea(map: any, area: any) {
        let latlng = new google.maps.LatLng(area.latCenter, area.lngCenter);
        map.setCenter(latlng);
        map.setZoom(17);
    }

    streatView(map: any, setor: any) {
        let latlng = new google.maps.LatLng(setor.latInicio, setor.lngInicio);

        var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('streat-view'), {
            position: latlng,
            pov: {
                heading: 34,
                pitch: 10
            },
            panControl: false,
            linksControl: false,
            rotateControl: false,
            motionTracking: false,
            motionTrackingControl: false
        });

        map.setStreetView(panorama);
    }

    public createPolylineOptions(setor: SetorModel, totalVagasUtilizadas: number) {
        return ({
            path: [{ lat: setor.latInicio, lng: setor.lngInicio }, { lat: setor.latFim, lng: setor.lngFim }],
            geodesic: true,
            strokeColor: this.determineColor(setor.total_vagas - totalVagasUtilizadas),
            strokeOpacity: 1,
            strokeWeight: 5,
            id: setor.codigo
        });
    }

    public createInfoPolylines(setor: SetorModel, area: any, totalVagasUtilizadas: number) {
        

        let div = document.createElement('div');
        div.className = "gm-style gm-style-iw";

        let divl = document.createElement('div');
        divl.className = "style-left";

        let divr = document.createElement('div');
        divr.className = "style-right";

        //const setorNome = (setor?.nome.toString().length < 3) ? ('Setor ' + setor.nome) : setor.nome;
        const setorNome = setor.nome;

        // console.log('ST', setorNome + " | " + setor.codigo);
        // console.log('AR', area);

        let h3 = document.createElement('h3');
        h3.className = "setor-codigo";
        //h3.innerText = setorNome + " (" + setor.codigo + ")" + " | Área: " + area.endereco + " (" + area.codigo + ")";
        // h3.innerText = area.endereco + " (" + area.codigo + ")" + " - " +setorNome;
        h3.innerText = setorNome + " - " + area.endereco;
        let h5vt = document.createElement('p');
        h5vt.className = "setor-vagas";
        h5vt.innerText = "Vagas: " + setor.total_vagas;

        let h5vn = document.createElement('p');
        h5vn.className = "setor-vagas-normal";
        // h5vn.innerText = "Vagas convencionais disponíveis: " + ((setor.total_vagas - (setor.vagas_idoso + setor.vagas_deficiente)) - setor.qtd_normal_estacionados);
        h5vn.innerText = "Vagas convencionais: " + (setor.total_vagas - setor.qtd_normal_estacionados);

        let h5vd = document.createElement('p');
        h5vd.className = "setor-vagas-pcd";
        h5vd.innerText = "Vagas de PCD: " + (setor.vagas_deficiente - setor.qtd_deficiente_estacionados);

        let h5vi = document.createElement('p');
        h5vi.className = "setor-vagas-i";
        h5vi.innerText = "Vagas de idoso: " + (setor.vagas_idoso - setor.qtd_idoso_estacionados);

        let h5vc = document.createElement('p');
        h5vc.className = "setor-vagas-cd";
        h5vc.innerText = "Vagas Carga/Descarga: " + (setor.vagas_carga_descarga - setor.qtd_carga_descarga_estacionados);

        let button = document.createElement('button');
        button.className = "btn-estacionar";
        button.innerText = "ESTACIONAR";
        let ico = document.createElement('img');
        ico.setAttribute("src", "assets/icones/estacionamento-white.svg");
        ico.className = "pin-view";
        button.appendChild(ico);


        button.addEventListener('click', () => {
            document.getElementById('btn-show-estacionar-page').setAttribute("setor", setor.codigo);
            document.getElementById('btn-show-estacionar-page').setAttribute("area", area.codigo);
            document.getElementById('btn-show-estacionar-page').setAttribute("setor-nome", setorNome);
            document.getElementById('btn-show-estacionar-page').setAttribute("area-nome", area.endereco);
            document.getElementById('btn-show-estacionar-page').click();
        });

        if ((setor.total_vagas - totalVagasUtilizadas) <= 0) {
            button.disabled = true;
        }

        let divpin = document.createElement('div');
        divpin.className = "btn-pin";
        // buttonView.innerText = "Ver";

        let iconpin = document.createElement('img');
        iconpin.setAttribute("src", "assets/icones/pin-dark.svg");
        iconpin.className = "pin-btn";
        divpin.appendChild(iconpin);

        let buttonView = document.createElement('button');
        buttonView.className = "btn-ver";
        // buttonView.innerText = "Ver";

        let icon = document.createElement('img');
        icon.setAttribute("src", "assets/icones/shopping-cart-white.svg");
        icon.className = "streat-view";
        buttonView.appendChild(icon);

        buttonView.addEventListener('click', () => {
            document.getElementById('btn-show-streat-view').setAttribute("setor", setor.codigo);
            document.getElementById('btn-show-streat-view').setAttribute("area", area.codigo);
            document.getElementById('btn-show-streat-view').click();
        });

        divl.appendChild(h3);
        // div.appendChild(h5vt);
        divr.appendChild(h5vn);
        divr.appendChild(h5vi);
        divr.appendChild(h5vd);
        divr.appendChild(h5vc);
        divr.appendChild(button);
        divl.appendChild(buttonView);
        div.appendChild(divl);
        div.appendChild(divr);
        div.appendChild(divpin);



        return div;
    }

    public determineColor(vagas: number): string {

        if (vagas > 0) {
            return Constants.SETOR_COLOR_GREEN;
        } else {
            return Constants.SETOR_COLOR_RED;
        }
    }

    public cleanPolylines() {
        for (let i = 0; i < MapUtil.polylines.length; i++) {
            MapUtil.polylines[i].setMap(null);
        }
    }

    public cleanInfoWindows() {
        for (let i = 0; i < MapUtil.infoWindows.length; i++) {
            document.getElementById(MapUtil.infoWindows[i]).remove();
        }
        MapUtil.infoWindows = [];
    }

    addYourLocationButton(map, platform) {

        let controlDiv = document.createElement('div');
        controlDiv.setAttribute("id", "control_left");

        let firstChild = document.createElement('button');
        firstChild.id = 'you_location_button';
        firstChild.style.backgroundColor = '#fff';
        firstChild.style.border = 'none';
        firstChild.style.outline = 'none';
        firstChild.style.width = '28px';
        firstChild.style.height = '28px';
        firstChild.style.borderRadius = '2px';
        firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
        firstChild.style.cursor = 'pointer';
        firstChild.style.marginRight = '10px';
        firstChild.style.padding = '0px';
        firstChild.title = 'Your Location';
        controlDiv.appendChild(firstChild);

        let secondChild = document.createElement('div');
        secondChild.style.margin = '5px';
        secondChild.style.width = '18px';
        secondChild.style.height = '18px';
        secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-1x.png)';
        // secondChild.style.backgroundImage = 'url("../assets/icon/mylocation-sprite-1x.png")';
        secondChild.style.backgroundSize = '180px 18px';
        secondChild.style.backgroundPosition = '0px 0px';
        secondChild.style.backgroundRepeat = 'no-repeat';
        secondChild.id = 'you_location_img';
        firstChild.appendChild(secondChild);

        firstChild.addEventListener('click', () => {
            //disable button for click
            let button = <HTMLElement>document.querySelector('#you_location_button');
            button.setAttribute("disabled", "disabled");
            // document.getElementById('you_location_button').setAttribute("disabled", "disabled");
            console.log('GPS');

            if (MapUtil.circles.length == 0) {
                // if (navigator.geolocation) {
                if (this.geolocation) {
                    // navigator.geolocation.getCurrentPosition(function (position) {
                    console.log('Platform: ' + platform)
                    console.log('iOS: ' + platform.is('ios'))
                    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
                        if (canRequest || (!canRequest && platform.is("ios"))) {
                            // this.showToast("Can request ...");
                            this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
                                .then(() => {
                                    let options = {
                                        enableHighAccuracy: true,
                                        timeout: 20000,
                                        maximumAge: 5000
                                    };

                                    this.geolocation.getCurrentPosition(options)
                                        .then((position) => {
                                            console.log('position: ' + JSON.stringify(position.coords));

                                            let latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                                            HomePage.bounds = 0;
                                            HomePage.latitude = position.coords.latitude;
                                            HomePage.longitude = position.coords.longitude;

                                            map.setCenter(latlng);
                                            map.setZoom(17);
                                            let element = <HTMLElement>document.querySelector('#you_location_img');
                                            if (element)
                                                element.style.backgroundPosition = '-144px 0px';

                                            //removing previous marker on map
                                            if (this.userLocationMarker) {
                                                this.userLocationMarker.setMap(null);
                                            }

                                            //add the new marker
                                            this.userLocationMarker = new google.maps.Marker({
                                                position: latlng,
                                                icon: {
                                                    url: "assets/icon/icon-map.svg",
                                                    scaledSize: new google.maps.Size(64, 64)
                                                }
                                                //map: HomePage.map
                                            });
                                            this.userLocationMarker.setMap(HomePage.map);
                                            // let circle = new google.maps.Circle({
                                            //     strokeColor: '#1E90FF',
                                            //     strokeOpacity: 0.2,
                                            //     strokeWeight: 2,
                                            //     fillColor: '#00BFFF',
                                            //     fillOpacity: 0.2,
                                            //     radius: 100,
                                            //     center: latlng
                                            // });
                                            // circle.setMap(HomePage.map);
                                            // MapUtil.circles.push(circle);
                                            button.removeAttribute("disabled");
                                        }).catch(error => {
                                            console.log('.getCurrentPosition: ', error);
                                            // this.showAlert('Localização', 'Para obter um melhor aproveitamento do Zona Fácil, recomendamos que ative o GPS do seu telefone', '', () => {});
                                            this.showToast("Sinal de GPS fraco ou desligado. Para obter um melhor aproveitamento, verifique se o GPS do seu telefone está ativado");
                                            button.removeAttribute("disabled");
                                        });
                                }, error => {
                                    console.log(".request: ", error.message);
                                    // this.showAlert('Localização', error.message, '', () => {});
                                    this.showToast("Sinal de GPS fraco ou desligado. Para obter um melhor aproveitamento, verifique se o GPS do seu telefone está ativado");
                                    console.log('gps not active by user ...');
                                    button.removeAttribute("disabled");
                                });

                        } else {
                            // this.showToast("Can t request ...");
                            console.log('can`t request ........');
                            button.removeAttribute("disabled");
                        }
                    });

                    //
                } else {
                    let element = <HTMLElement>document.querySelector('#you_location_img');
                    element.style.backgroundPosition = '-144px 0px';
                }
            }
        });

        map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
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

    showToast(msg: string) {
        const toast = this.toastCtrl.create({
            message: msg,
            duration: 6000,
            position: 'bottom'
        });
        toast.present();
    }
}
