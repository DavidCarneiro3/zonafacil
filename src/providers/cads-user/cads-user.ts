import { Injectable } from '@angular/core';
import { AngularFireDatabase } from "angularfire2/database";

import { CadUserModel } from "../../models/cad-user";

import { Constants } from "../../environments/constants";

@Injectable()
export class CadsUserProvider {

    constructor(public afd: AngularFireDatabase) {
    }

    save(userID: string, cadID: string, entity: CadUserModel) {
        return this.afd.list(Constants.PATH_DOCUMENTS_CADS_USER + cadID + '/' + userID).push(entity);
    }

    update(userId: string, cadID: string, entity) {
        return this.afd.object(Constants.PATH_DOCUMENTS_CADS_USER + userId + '/' + cadID).set(entity);
    }

    getCads(userID: string) {
        return this.afd.list(Constants.PATH_DOCUMENTS_CADS_USER + '/' + userID)
            .snapshotChanges()
            .map(snapshot => snapshot.map(item => ({ key: item.payload.key, item: item.payload.val() })));
    }

    getQtdCadsUsados(userID: string) {
        return this.afd.object(Constants.PATH_DOCUMENTS_CADS_USER + userID + "/qtdCadsUsados").valueChanges()
    }

    updateQtdCadsUsadas(userID: string, entity: number) {
        return this.afd.object(Constants.PATH_DOCUMENTS_CADS_USER + userID + "/qtdCadsUsados").set(entity);
    }

    findQtdCads(userID: string) {
        return this.afd.list(Constants.PATH_DOCUMENTS_CADS_USER + '/' + userID)
            .snapshotChanges()
            .map(snapshot => snapshot.map(item => ({ key: item.payload.key, item: item.payload.val() })));
    }
}
