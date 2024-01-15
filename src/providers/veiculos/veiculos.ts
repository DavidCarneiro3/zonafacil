import { VeiculoModel } from './../../models/veiculo';
import { Constants } from './../../environments/constants';
import { AngularFireDatabase } from 'angularfire2/database';
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/first';

@Injectable()
export class VeiculosProvider {

  constructor(public afd: AngularFireDatabase) {
  }

  findByUser(userId: string) {
    return this.afd.list(Constants.PATH_DOCUMENTS_VEICULOS + userId, ref => ref.orderByKey()).snapshotChanges()
      .map(changes => changes.map(c => ({ key: c.payload.key, veiculo: new VeiculoModel(c.payload.val()) })));
  }

  findByVeiculo(veiculoID: string, userID: string) {
    return this.afd.object(Constants.PATH_DOCUMENTS_VEICULOS + userID + '/' + veiculoID)
        .valueChanges()
        // .map(changes => changes.map(c => ({ key: c.payload.key, veiculo: c.payload.val() })));
  }

  remove(userId, itemId) {
    this.afd.object(Constants.PATH_DOCUMENTS_VEICULOS + '/' + userId + '/' + itemId).remove();
  }
  
  save(userId, entity) {
    return this.afd.list(Constants.PATH_DOCUMENTS_VEICULOS + '/' + userId).push(entity);
  }
  
  update(userId, entity) {
    return this.afd.object(Constants.PATH_DOCUMENTS_VEICULOS + '/' + userId + '/' + entity.id).set(entity);
  }

  getTiposVeiculo() {
    return this.afd.list(Constants.PATH_DOCUMENTS_TIPO_VEICULO).snapshotChanges().
      map(snapshot => snapshot.map(tipo => ({key: tipo.payload.key, tipo: tipo.payload.val()})));
  }

}
