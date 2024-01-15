import { Injectable } from '@angular/core';
import { AngularFireDatabase } from "angularfire2/database";
import { Constants } from "../../environments/constants";

@Injectable()
export class HolidaysProvider {
    constructor(public afd: AngularFireDatabase) {

    }
    /**
     * Lista todos os feriados no firebase
     * @returns return um objecto com os feriados e as chaves correspondentes
     */
    listAll(): any {
        return this.afd.list(Constants.PATH_DOCUMENTS_HOLIDAYS)
            .snapshotChanges()
            .map(snapshots => snapshots.map(holidays => {
                return holidays.payload.val()
            }
            ))
    }
}