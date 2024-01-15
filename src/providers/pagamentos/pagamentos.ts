import { PagamentoModel } from './../../models/pagamento';
import { Constants } from './../../environments/constants';
import { AngularFireDatabase } from 'angularfire2/database';
import { Injectable } from '@angular/core';

@Injectable()
export class PagamentosProvider {

  constructor(public afd: AngularFireDatabase) {
  }

  findByUser(userId) {
    return this.afd.list(Constants.PATH_DOCUMENTS_PAGAMENTOS + userId, ref => ref.orderByKey()).snapshotChanges()
      .map(changes => changes.map(c => {

          let pgto = new PagamentoModel(c.payload.val());
          pgto.id = c.payload.key;

          return { key: pgto.id, values: pgto };
        }
      ));
  }

  findByUserAndCartao(userId, cartaoId) {
    return this.afd.list(Constants.PATH_DOCUMENTS_PAGAMENTOS + userId + '/' + cartaoId, ref => ref.orderByKey()).snapshotChanges()
      .map(changes => changes.map(c => ({key: c.payload.key, values: c.payload.val()})));
  }

  remove(userId, cartaoId) {
    return this.afd.object(Constants.PATH_DOCUMENTS_PAGAMENTOS + userId + '/' + cartaoId).remove();
  }
  
  save(userId, entity) {
    return this.afd.list(Constants.PATH_DOCUMENTS_PAGAMENTOS + userId).push(entity);
  }
  
  update(userId, entityID, entity) {
    return this.afd.object(Constants.PATH_DOCUMENTS_PAGAMENTOS + userId + '/' + entityID).set(entity);
  }

}
