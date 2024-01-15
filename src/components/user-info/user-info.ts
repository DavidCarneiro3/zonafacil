import { Component, OnDestroy, ViewChild } from '@angular/core';
import { AlertController, MenuController, ModalController, Nav, Platform, Events } from "ionic-angular";
import { Subscription } from "rxjs/Subscription";

import { CadModel } from '../../models/cad';
import { User } from "../../models/user";

import { CadsUserProvider } from "../../providers/cads-user/cads-user";
import { CadsProvider } from "../../providers/cads/cads";
import { UserProvider } from "../../providers/user/user";
import { LoggerProvider } from '../../providers/logger/logger';

import { Constants } from "../../environments/constants";

@Component({
    selector: 'user-info',
    templateUrl: 'user-info.html'
})
export class UserInfoComponent implements OnDestroy {
    @ViewChild(Nav) nav: Nav;
    user: User;
    cads: number = 0;
    cadsUsados: number = 0;
    cad = new CadModel();
    name: string = '';

    subCadsUser: any;
    subscription: Subscription = new Subscription();

    constructor(private userProvider: UserProvider,
        private cadsUserProvider: CadsUserProvider, private cadsProvider: CadsProvider,
        private logger: LoggerProvider,
        public modalCtrl: ModalController, public menu: MenuController, private events: Events) {

        this.carregaUsuarioComCADs();
    
        // listen quando o usuário se logar
        this.events.subscribe('user:load', (userId) => {
            this.logger.info('**user-info** user:load | userId: ' + userId);
            this.userProvider.byId(userId).take(1).subscribe((user: User) => {
                if (user) {
                    this.user = new User(user);
                    console.log(this.user.name)
                    this.logger.info('user: ' + JSON.stringify(this.user));
                    this.name = JSON.stringify(this.user);
                    this.subCadsUser = this.cadsUserProvider.getCads(this.user.id).subscribe(value => {
                        this.cadsUsados = 0;
                        this.cads = 0;

                        value.map(value => {
                            if (value.key == "qtdCadsUsados") {
                                this.cadsUsados = value.item;
                            } else {
                                this.cads += value.item.qtdCads;
                            }
                        });

                    });
                }
            });
        });

        this.cadsProvider.find().take(1).subscribe(item => {
            item.map(item => {
                this.cad = new CadModel(item.cad);
            });
        });
    }

    namePattern(name){
        var arr = name.split(' ');
        var keep = arr[1][0].toUpperCase() != arr[1][0];
        return arr.slice(0, keep ? 3 : 2).join(' ');
    }

    

    carregaUsuarioComCADs() {
        this.userProvider.getUserLocal().then(userID => {
            this.userProvider.byId(userID).take(1).subscribe((user: User) => {
                if (user) {
                    this.user = new User(user);
                    this.logger.info('user: ' + JSON.stringify(this.user));
                    this.user = new User(user);
                    this.name = this.namePattern(this.user.name.toString())
                    console.log(name)
                    this.subCadsUser = this.cadsUserProvider.getCads(this.user.id).subscribe(value => {
                        this.cadsUsados = 0;
                        this.cads = 0;

                        value.map(value => {
                            if (value.key == "qtdCadsUsados") {
                                this.cadsUsados = value.item;
                            } else {
                                this.cads += value.item.qtdCads;
                            }
                        });

                    });
                }
            });
        });
    }

    ngOnDestroy(): void {
        this.subscription.add(this.subCadsUser);
        this.subscription.unsubscribe();
    }

    cadastrarPDV() {
        const page = this.modalCtrl.create(Constants.ROOT_PAGE.name, { fromPage: "pdv", user: this.user, backoption: 'ok' });
        page.present();
        this.menu.close();
    }

    

}
