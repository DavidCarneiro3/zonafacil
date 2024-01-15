import { Constants } from './../../environments/constants';
import { AngularFireDatabase } from "angularfire2/database";
import { Injectable } from '@angular/core';

@Injectable()
export class InfoProvider {

  constructor(public afd: AngularFireDatabase) {
  }

  getTermos() {
    return this.afd.list(Constants.PATH_DOCUMENTS_TERMS + '/termos').snapshotChanges().map(changes => {
      return changes.map(c => ({ $key: c.payload.key, ...c.payload.val() }));
    });
  }

}
