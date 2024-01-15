import {Injectable} from '@angular/core';
import {AngularFireDatabase} from "angularfire2/database";
import {Constants} from '../../environments/constants';
import {SetorModel} from "../../models/setor";

@Injectable()
export class SetoresProvider {

    constructor(public afd: AngularFireDatabase) {
    }

    getSetoresByLocation() {
        return this.afd.list(Constants.PATH_DOCUMENTS_SETORES)
            .snapshotChanges()
            .map(snapshot => snapshot.map(setores => ({key: setores.payload.key, setores: setores.payload.val()})));
    }

    getSetoresByArea(areaCodigo){
        return this.afd.list(Constants.PATH_DOCUMENTS_SETORES + areaCodigo)
            .snapshotChanges()
            .map(snapshot => snapshot.map(setor => ({key: setor.payload.key, setor: setor.payload.val()})));
        ;        
    }

    byId(areaCodigo: string, setorCodigo: string) {
        return this.afd.object(Constants.PATH_DOCUMENTS_SETORES + areaCodigo + "/" + setorCodigo).valueChanges();
    }

    update(setor: SetorModel, areaCodigo: string) {
        return this.afd.object(Constants.PATH_DOCUMENTS_SETORES + areaCodigo + "/" + setor.codigo).update(setor);
    }

    getConfigQtdCadsSetor() {
        return this.afd.object(Constants.PATH_DOCUMENTS_CONFIG + "cads_setor").valueChanges();
    }

}
