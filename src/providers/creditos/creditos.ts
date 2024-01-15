import { Injectable } from '@angular/core';
import { Constants } from "../../environments/constants";
import { AngularFireDatabase } from "angularfire2/database";
import { CreditoModel } from "../../models/credito";

@Injectable()
export class CreditosProvider {

    constructor(public afd: AngularFireDatabase) {
    }

    countAll() {
        return this.afd.list(Constants.PATH_DOCUMENTS_CREDITOS)
            .snapshotChanges()
            .map(changes => changes.map(c => ({ key: c.payload.key, values: c.payload.val() })))
            .map(changes => {
                let cont = 1;
                changes.forEach(_item => {
                    cont += Object.keys(_item.values).length;
                });

                return cont;
            });
    }

    update(creditoId, userID, credito) {
        return this.afd.object(Constants.PATH_DOCUMENTS_CREDITOS + userID + "/" + creditoId).update(credito)
    }

    public findByUser(userID: string) {
        return this.afd.list(Constants.PATH_DOCUMENTS_CREDITOS + userID,
            ref => ref.orderByChild('dataHoraRegistro'))
            .snapshotChanges()
            .map(changes => changes.map(c => ({ key: c.payload.key, values: new CreditoModel(c.payload.val()) })))
            .map(changes => changes.reverse());
    }

    public save(userID: string, entity: CreditoModel) {
        return this.afd.object(Constants.PATH_DOCUMENTS_CREDITOS + userID + '/' + entity.id)
            .update(entity)
            .then(result => {
                return true;
            }).catch(result => {
                return false;
            });
    }
}
