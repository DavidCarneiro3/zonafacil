import { Injectable } from '@angular/core';
// FIREBASE
import { AngularFireDatabase } from "angularfire2/database";

// MODELS
import { EstacionarModel } from "../../models/estacionar";
import { AgendarEstacionamentoModel } from "../../models/agendamento";

// CONSTANTS
import { Constants } from "../../environments/constants";

@Injectable()
export class EstacionarProvider {

    public static qtdNormal = 0;

    constructor(public afd: AngularFireDatabase) {
    }

    save(estacionar: EstacionarModel, userID: string) {
        return this.afd.object(Constants.PATH_DOCUMENTS_ESTACIONAR + userID + "/" + estacionar.id)
            .update(estacionar)
            .then(result => {
                return true;
            }).catch(result => {
                return false;
            });
    }

    update(estacionarId, userID, estacionar) {
        return this.afd.object(Constants.PATH_DOCUMENTS_ESTACIONAR + userID + "/" + estacionarId)
            .update(estacionar);
    }

    findByUser(userID: string) {
        return this.afd.list(Constants.PATH_DOCUMENTS_ESTACIONAR + userID,
            ref => ref.orderByChild("status").equalTo(true))
            .snapshotChanges()
            .map(changes => changes.map(c => ({ key: c.payload.key, estacionar: c.payload.val() })))
            // .map(changes => changes.map(c => {
            //         c.estacionar.veiculo = this.veiculoProvider.findByVeiculo(c.estacionar.veiculo_id, userID).map(c => c.veiculo);
            //         return c;
            //     })
            // )
            ;
    }

    find(userID: string) {
        return this.afd.list(Constants.PATH_DOCUMENTS_ESTACIONAR + userID)
            .snapshotChanges()
            .map(changes => changes.map(c => ({ key: c.payload.key, estacionar: (c.payload.val()) })))
            .map(changes => changes.reverse());
    }

    findByAll() {
        return this.afd.list(Constants.PATH_DOCUMENTS_ESTACIONAR)
            .snapshotChanges()
            .map(changes => changes.map(c => ({ key: c.payload.key, estacionamentos: c.payload.val() })));
    }

    countAll() {
        return this.afd.list(Constants.PATH_DOCUMENTS_ESTACIONAR)
            .snapshotChanges()
            .map(changes => changes.map(c => ({ key: c.payload.key, estacionamentos: c.payload.val() })))
            .map(changes => {
                let cont = 1;
                changes.forEach(_item => {
                    cont += Object.keys(_item.estacionamentos).length;
                });

                return cont;
            });
    }

    countCadsById(id){
        return this.afd.list(Constants.PATH_DOCUMENTS_ESTACIONAR + id)
            .snapshotChanges()
            .map(changes => changes.map(c => ({ key: c.payload.key, estacionamentos: c.payload.val() })))
            .map(changes => {
                let cont = 0;
                changes.forEach(_item => {
                    cont += _item.estacionamentos.comprovante.cads;
                });

                return cont;
            });
    }

    findByAreaAndSetor(userID: string, areaID: string, setorID: string) {
        return this.afd.list(Constants.PATH_DOCUMENTS_ESTACIONAR + userID,
            ref => ref.orderByChild("area_id").equalTo(areaID) && ref.orderByChild("setor_id").equalTo(setorID))
            .snapshotChanges()
            .map(changes => changes.map(c => ({ key: c.payload.key, estacionar: new EstacionarModel(c.payload.val()) })));
    }

    findByVeiculo(userID: string, veiculoID: string) {
        return this.afd.list(Constants.PATH_DOCUMENTS_ESTACIONAR + userID, ref => ref.orderByChild("veiculo_id").equalTo(veiculoID))
            .snapshotChanges()
            .map(changes => changes.map(c => ({ key: c.payload.key, estacionar: new EstacionarModel(c.payload.val()) })));
    }

    isVeiculoEstacionado(userID: string, veiculoID: string, imei: string, profile: string) {
        return this.afd.list(Constants.PATH_DOCUMENTS_ESTACIONAR + userID,
            // ref => ref.orderByChild("veiculo_id").equalTo(veiculoID) && ref.orderByChild("status").equalTo(true))
            ref => ref.orderByChild("status").equalTo(true))
            .snapshotChanges()
            .map(changes => changes.map(c => ({ key: c.payload.key, podeEstacionar: 'ok', estacionar: new EstacionarModel(c.payload.val()) })))
            .map(changes => {
                let cont = 0;
                let cadsAtivos = 0;

                changes.forEach((_item, _index) => {
                    cadsAtivos += _item.estacionar.qtd // incrementa a quantidade de cads ativos , de modo a permitir no máximo 3 cads por aparelho
                    if (_item.estacionar.uidAparelho == imei && _item.estacionar.veiculo_id === veiculoID) {
                        cont++
                    }
                });

                // console.log('******* CONTAD ', cont);
                if (cadsAtivos >= 3 && profile !== 'revendedor') {
                    return { podeEstacionar: undefined, lista: changes };

                }
                // if (cont >= 3 && profile !== 'revendedor') {
                // console.log('******* MAIOR QUE 3 ', cont);
                // throw new Error('Você só pode ter no máximo 3 placas com CAD ativado por aparelho.');
                // changes['podeEstacionar'] = 'nao';
                // }

                return {
                    podeEstacionar: 'sim', lista: changes.filter(changes => changes.estacionar.veiculo_id == veiculoID), cadsAtivos: cadsAtivos
                };
            })
            // .map(changes => changes.podeEstacionar ? changes.lista.filter(changes => changes.estacionar.veiculo_id === veiculoID) : changes)
            ;
    }

    atualizaStatusPeloTempoExpirado(userID, veiculoID, callback) {
        this.findByVeiculo(userID, veiculoID).take(1).subscribe(value => {
            value.map(value => {
                if (value.estacionar != null) {
                    // value.estacionar.status = false;
                    // this.save(value.estacionar, userID);
                    this.update(value.estacionar.id, userID, { status: false })
                    callback();
                    // this.status = false;
                    // this.setorProvider.byId(value.estacionar.area_id, value.estacionar.setor_id).take(1).subscribe((item: SetorModel) => {
                    //     //item.vagas_disponiveis = item.vagas_disponiveis + 1;
                    //     this.setorProvider.update(item, value.estacionar.area_id);
                    // });
                }
            });
        });
    }

    /**
     * Agenda um estacionamento para o próximo horario que o setor estiver disponivel
     * @param agendamento objecto do tipo AgendarModel contento as informações do estacionamento a ser agendado
     * @returns string informando o satus do agendamento
     */
    agendarEstacionamento(agendamento: AgendarEstacionamentoModel): Promise<any> {
        return this.afd.object(Constants.PATH_DOCUMENTS_ANGENDAMENTOS + agendamento.id)
            .update(agendamento)
            .then(result => {
                console.log(`Agendamento bem sucedido`)
                return 'Agendamento realizado com sucesso!'
            })
            .catch(error => {
                console.log(`Algo de errado ocorreu , ${error}`);
                return 'Algo deu errado , por favor tente novamente!'
            })
    }

}
