import {Injectable} from '@angular/core';
import {AngularFireDatabase} from "angularfire2/database";
import {Constants} from '../../environments/constants';

@Injectable()
export class AreaProvider {

    constructor(
        public afd: AngularFireDatabase
    ) {
    }

    getAreas() {
        return this.afd.list(Constants.PATH_DOCUMENTS_AREAS)
            .snapshotChanges()
            .map(snapshot => snapshot.map(area => ({key: area.payload.key, area: area.payload.val()})));
    }
}
