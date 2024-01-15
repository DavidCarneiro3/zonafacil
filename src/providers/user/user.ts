import { User } from '../../models/user';
import { Constants } from '../../environments/constants';
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import * as firebase from "firebase";
import { Storage } from "@ionic/storage";
import { Platform } from 'ionic-angular';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import { Uid } from '@ionic-native/uid';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { LoggerProvider } from '../logger/logger';


@Injectable()
export class UserProvider {

    static APP_NAME: string = 'zonaazulfortaleza_';

    currentUser: Observable<any>;

    constructor(
        public afa: AngularFireAuth,
        public afd: AngularFireDatabase,
        public platform: Platform,
        private androidPermissions: AndroidPermissions,
        private uid: Uid,
        private uniqueDeviceID: UniqueDeviceID,
        private logger: LoggerProvider,
        private storage: Storage) {

        this.listenAuthState();
    }

    byId(id: string) {
        return this.afd.object(Constants.PATH_DOCUMENTS_USER + id).valueChanges();
    }

    listUsers() {
        return this.afd.list(Constants.PATH_DOCUMENTS_USER).valueChanges();
    }

    saveUser(user: User) {
        return this.afd.object(Constants.PATH_DOCUMENTS_USER + user.id).update(user);
    }

    updateUser(id, itemUpdate) {
        return this.afd.object(Constants.PATH_DOCUMENTS_USER + id).update(itemUpdate);
    }

    updateConfig(id, config, value) {
        const prop = {
            [config]: value
        }
        return this.afd.object(Constants.PATH_DOCUMENTS_USER + id + '/configuracao').update(prop);
    }
    updateEmail(newEmail: string) {
        return this.afa.auth.currentUser.updateEmail(newEmail)
    }

    updateUuidOrImei(id, callback = undefined) {
        // if (this.platform.is('cordova')) {
        //     if (this.platform.is('android')) {

        //         this.getImei().then(_imei => {
        //             this.logger.info('MOBILE - IMEI [ANDROID]: ' + _imei);
        //             this.updateUser(id, { uidAparelho: _imei });

        //             if (callback) {
        //                 callback(_imei);
        //             }
        //         });

        // } else {
        this.uniqueDeviceID.get().then(uuid => {
            this.logger.info('MOBILE - UUID [iOS]: ' + uuid);
            this.updateUser(id, { uidAparelho: uuid });

            if (callback) {
                callback(uuid);
            }
        });
        // }
        // } else {
        //     callback('');
        // }
    }

    getUserLocal() {
        return this.storage.get(UserProvider.APP_NAME + 'user');
    }

    saveUserLocal(user: string) {
        return this.storage.set(UserProvider.APP_NAME + 'user', user);
    }

    removeUserLocal(): Promise<any> {
        return this.storage.remove(UserProvider.APP_NAME + 'user');
    }

    private listenAuthState(): void {
        this.afa.authState.subscribe((user: firebase.User) => {
            if (user) {
                this.currentUser = this.afd.object(Constants.PATH_DOCUMENTS_USER + user.uid).valueChanges();
            }
        });
    }

    async getImei() {
        const { hasPermission } = await this.androidPermissions.checkPermission(
            this.androidPermissions.PERMISSION.READ_PHONE_STATE
        );

        if (!hasPermission) {
            const result = await this.androidPermissions.requestPermission(
                this.androidPermissions.PERMISSION.READ_PHONE_STATE
            );

            if (!result.hasPermission) {
                throw new Error('Permissions required');
            }

            // ok, a user gave us permission, we can get him identifiers after restart app
            return;
        }
        return this.uid.IMEI;
    }

}
