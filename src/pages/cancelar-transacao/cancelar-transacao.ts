import { Component } from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  ViewController,
  AlertController,
  Events,
  LoadingController,
  Loading
} from 'ionic-angular';


import { User } from './../../models/user';
import { CanceladoModel } from './../../models/estacionar';
import { CreditoModel } from '../../models/credito';
import { CadModel } from '../../models/cad';

import { UserProvider } from '../../providers/user/user';
import { ComunicacaoCentralProvider } from '../../providers/comunicacao-central/comunicacao-central';
import { CreditosProvider } from '../../providers/creditos/creditos'
import { PagarmeProvider } from "../../providers/pagarme/pagarme";
import { CadsUserProvider } from "../../providers/cads-user/cads-user";
import { TempoEstacionadoProvider } from '../../providers/tempo-estacionado/tempo-estacionado';

import { DateUtil } from '../../util/date.util';
import { Constants } from '../../environments/constants';


@IonicPage()
@Component({
  selector: 'page-cancelar-transacao',
  templateUrl: 'cancelar-transacao.html',
})
export class CancelarTransacaoPage {

  credito: CreditoModel
  //estacionar: EstacionarModel;
  user: User;
  motivo;
  cad: CadModel;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public events: Events,
    private creditoProvider: CreditosProvider,
    private pagarmeProvider: PagarmeProvider,
    private cadsUserProvider: CadsUserProvider,
    private tempoEstacionadoProvider: TempoEstacionadoProvider,
    private comunicacaoCentralProvider: ComunicacaoCentralProvider,
    private userProvider: UserProvider) {

    this.comunicacaoCentralProvider.setDMA_NTP();
    this.init();
  }

  ionViewCanEnter() {
    this.userProvider.getUserLocal().then(userID => {
      if (userID && this.credito) {
        return true;
      }
    });
  }

  init() {
    const estacionarStr = this.navParams.get('credito');
    this.cad = this.navParams.get('cad')
    if (estacionarStr) {
      this.credito = JSON.parse(estacionarStr);
    }
    this.userProvider.getUserLocal().then(userID => {
      if (userID) {
        this.userProvider.byId(userID).take(1).subscribe((user: User) => this.user = user);
      }
    });
  }

  updateData() {
    if (!this.user) {
      return;
    }

    this.showAlert(
      "Cancelamento", "Tem certeza que deseja prosseguir com a solicitação de cancelamento?", "", () => {
        this.tempoEstacionadoProvider.getHoraAtualFromFirebase().then(data => {
          let loading: Loading = this.loadingCtrl.create({ content: 'Aguarde ...' })
          loading.present()
          this.operacaoLinkL2(this.credito, data.dateNow, (dataProcessamento, autenticacao) => {
            this.efetuarEstorno(this.credito).then(response => {
              console.log(response)
              if (response.status == 'refunded') {

                this.credito.dadoCancelamento = new CanceladoModel();
                this.credito.dadoCancelamento.dataHoraRegistro = dataProcessamento;
                this.credito.dadoCancelamento.autenticacao = autenticacao;
                this.credito.dadoCancelamento.motivoCancelamento = this.motivo
                this.credito.status = 'cancelado'
                this.creditoProvider.update(this.credito.id, this.user.id, this.credito);

                const cads = (this.getValor(this.credito) / this.cad.valor_unitario)
                let horaCancelado = new Date(dataProcessamento).getTime()
                this.events.publish('cancelAttempt', { data: horaCancelado, try: true });

                this.updateQtdCadsUsados(this.user.id, cads)
                loading.dismiss()

                this.showAlert('Tudo certo', 'Solicitação realizada com sucesso!', "", () => {
                  this.navCtrl.setRoot(Constants.PRINCIPAL_PAGE.name)

                }, () => { }, 'OK', 'Cancelar')
              }
              else {
                loading.dismiss()
                this.showAlert('Erro', 'Ocorreu algum problema durante sua solitação de cancelamento. Tente novamente em alguns instantes', "", () => { }, () => { }, 'OK', 'Cancelar')
              }
            })

          });
        });

      }, () => { }, 'Confirmar');


  }

  showAlert(title: string, msg: string, type: string, success, error, btnOk = "Confirmar", btnCancelar = 'Cancelar') {

    const okBtn = {
      text: btnOk,
      cssClass: 'btn-ok',
      handler: data => {
        success();
      }
    };

    const cancelBtn = {
      text: btnCancelar,
      cssClass: 'btn-ok',
      handler: data => {
        error();
      }
    };

    const btns = [];

    btns.push(cancelBtn);

    if (btnOk !== '')
      btns.push(okBtn);


    let alert = this.alertCtrl.create({
      title: title,
      message: msg,
      cssClass: type,
      buttons: btns
    });
    alert.present();
  }

  operacaoLinkL2(credito: CreditoModel, dataEnvio: Date, callback = undefined) {
    this.verificaLinkL2(credito, dataEnvio)
      .then(response => {

        const dataProcessamentoStr = response['dataProcessamento'];
        const dataProcessamento = DateUtil.convertDate(dataProcessamentoStr);

        const autenticacao = response['autenticacao'];

        if (response['sucesso'] || response['sucesso'] === 'true') {
          if (callback) {

            callback(dataProcessamento, autenticacao);
          }
        } else {
          this.showAlert('Atenção', 'Não foi possível cancelar a Operação. Para mais informações entre em contato com nosso canal de atendimento.', '', () => { }, () => { }, '', 'OK');
        }

      }).catch(error => {
        this.showAlert('Indisponível', 'Não foi possível estabelecer uma comunicação com o serviço da AMC. Para mais informações entre em contato com nosso canal de atendimento.', '', () => { }, () => { }, '', 'OK');
      })
  }

  verificaLinkL2(credito: CreditoModel, dataEnvio: Date) {
    if (this.user.profile === 'revendedor') {

    } else {
      let cancel_id = DateUtil.uniqueID()
      console.log(cancel_id)
      this.comunicacaoCentralProvider.consultaTransacaoApp(credito.idTransacao)
      this.comunicacaoCentralProvider.consultaTransacaoApp(cancel_id)
      /* Funciona paramentro idTranscacao id gerado na propria operecao de cancelamento
        idTransacao cancelamento é o paramentro obitdo na hora da compra de CADS pelo usuário
        this.comunicacaoCentralProvider.cancelamentoApp(teste,this.motivo,1784465179,dataEnvio) */
      return this.comunicacaoCentralProvider.cancelamentoApp(cancel_id, this.motivo, credito.idTransacao, dataEnvio)

    }
  }

  updateQtdCadsUsados(userID: string, cads: number) {
    this.cadsUserProvider.getQtdCadsUsados(this.user.id).take(1).subscribe(item => {
      this.cadsUserProvider.updateQtdCadsUsadas(userID, (cads + <number>item));
    });
  }

  efetuarEstorno(credito) {

    return this.pagarmeProvider.estorno(credito)
  }

  getValor(credito: CreditoModel) {
    if (!credito)
      return 0;

    return credito.valorSemDesconto ? credito.valorSemDesconto : credito.valor;
  }

  close() {
    this.navCtrl.setRoot(Constants.HISTORICO_PAGE.name)
  }

}
