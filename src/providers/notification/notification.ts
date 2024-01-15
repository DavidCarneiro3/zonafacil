import { App } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { UserProvider } from './../user/user';
import { Platform } from 'ionic-angular';
import { PushOptions, PushObject, Push } from '@ionic-native/push';
import 'rxjs/add/operator/take';
import { Constants } from '../../environments/constants';
import { LoggerProvider } from '../logger/logger';

@Injectable()
export class NotificationProvider {

  static SENDER_ID = '722683236957';

  options: PushOptions = {
    android: {
      senderID: NotificationProvider.SENDER_ID,
      icon: 'logowhite'
    },
    ios: {
      alert: 'true',
      badge: true,
      sound: 'true'
    },
    windows: {},
    browser: {
      pushServiceURL: 'http://push.api.phonegap.com/v1/push'
    }
  };

  pushObject: PushObject;
  subscribe: Subscription;
  subscribe2: Subscription;

  constructor(
    private push: Push,
    public platform: Platform,
    public app: App,
    private logger: LoggerProvider,
    private userService: UserProvider) {

    if (Push['installed']()) {
      this.push.hasPermission().then((res: any) => {
        if (res.isEnabled) {
          this.logger.error('We have permission to send push notifications');
        } else {
          this.logger.error('We do not have permission to send push notifications');
        }
      });
    }
  }

  private listenNotificacaoErro(pushObject) {
    if (!this.subscribe2) {
      this.subscribe2 = pushObject.on('error').subscribe(error =>
        this.logger.error('Error with Push plugin: ' + JSON.stringify(error)));
    }
  }

  private listenNotificacao(pushObject) {
    if (!this.subscribe) {
      this.subscribe = pushObject.on('notification').subscribe(notification => {
        this.logger.debug('Received a notification: ' + JSON.stringify(notification));
        if (!notification.additionalData.foreground) {
          this.app.getRootNavs()[0].setRoot(Constants.TEMPO_RESTANTE_PAGE.name);
        }
      });
    }
  }

  /**
   * Salva o 'registrationId' na entidade usuario para enviar Push do Firebase Functions
   */
  private registrar(pushObject, idUser: string) {
    this.logger.info('[NotificationProvider-registrar]');
    return new Promise<string>((resolve, reject) => {

      pushObject.on('registration').take(1).subscribe(registration => {
        this.logger.info('Device registered: ' + JSON.stringify(registration));

        this.userService.updateUser(idUser, { notificationKey: registration.registrationId })
        // .then(_ => alert('ok'))
        // .catch(error => reject('Você precisa habilitar as permissões para utilizar o aplicativo!'));

        resolve('ok');

      }, error => {
        this.logger.error('GPS desabilitado. Error: ' + JSON.stringify(error));
        reject('Você precisa habilitar as permissões para utilizar o aplicativo!')
      });
    });
  }

  /**
   * Inicia o servico de Push
   */
  inicialize(idUser: string) {
    return new Promise<string>((resolve, reject) => {

      this.destroy();
      if ((this.platform.is('android') || this.platform.is('ios')) && Push['installed']()) {
        this.logger.info('[NotificationProvider-inicialize] - phonegap-plugin-push instalado com sucesso!');

        this.pushObject = this.push.init(this.options);

        this.listenNotificacao(this.pushObject);

        this.registrar(this.pushObject, idUser)
          .then(_data => {
            resolve(_data);
          })
          .catch(error => reject(error));

        this.listenNotificacaoErro(this.pushObject);

      } else {
        this.logger.error('[NotificationProvider-inicialize] phonegap-plugin-push NAO instalado corretamente!');
        resolve('[NotificationProvider-inicialize] phonegap-plugin-push NAO instalado corretamente!');
      }
    });
  }

  destroy() {
    this.logger.info('[NotificationProvider-destroy]');

    if (this.subscribe !== undefined)
      this.subscribe.unsubscribe();

    if (this.subscribe2 !== undefined)
      this.subscribe2.unsubscribe();
  }

}
