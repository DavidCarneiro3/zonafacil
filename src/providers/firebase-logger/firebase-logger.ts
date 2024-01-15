import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { UserProvider } from '../user/user';
import { Constants } from '../../environments/constants';

@Injectable()
export class FirebaseLoggerProvider {

  constructor(public afd: AngularFireDatabase, public userProvider: UserProvider) {
  }

  enviarFirebase(entity) {
    this.userProvider.getUserLocal().then(userId => {
      this.afd.list(Constants.PATH_DOCUMENTS_LOGS + '/' + userId).push(entity);
    });
  }

}
