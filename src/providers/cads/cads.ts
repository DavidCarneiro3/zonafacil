import {Injectable} from '@angular/core';
import {AngularFireDatabase} from "angularfire2/database";
import {Constants} from "../../environments/constants";

@Injectable()
export class CadsProvider {

    constructor(public afd: AngularFireDatabase) {
    }

    find() {
        return this.afd.list(Constants.PATH_DOCUMENTS_CADS)
            .snapshotChanges()
            .map(changes => changes.map(c => ({key: c.payload.key, cad: c.payload.val()})));
    }

}
