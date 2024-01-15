import { AngularFireDatabase } from 'angularfire2/database';
import { Injectable } from '@angular/core';

import * as firebase from 'firebase/app';

@Injectable()
export class TempoEstacionadoProvider {

    constructor(public afd: AngularFireDatabase) {
    }

    /**
     * Retorna a hora agora do firebase
     *
     * incremento: corresponde aos acrescimos. Por padrao retorna a data e hora do firebase, mas para calcular o tempo futuro passa os acrescimos
     */
    getHoraAtualFromFirebase(incremento = 0) {
        return firebase.database().ref('/.info/serverTimeOffset')
            .once('value')
            .then(data => {
                const timeinmilisNow = data.val() + Date.now();
                const timeinmilis = data.val() + Date.now() + incremento;
                return { now: timeinmilisNow, dateNow: new Date(timeinmilisNow), timeinmilis: timeinmilis, date: new Date(timeinmilis) };
            });
    }

}
