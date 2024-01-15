import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Camera } from "@ionic-native/camera";
import { AndroidPermissions } from '@ionic-native/android-permissions';
import {
  IonicPage, NavController,
  NavParams, AlertController,
  ModalController, ActionSheetController,
  LoadingController, Events
} from 'ionic-angular';
import { Subscription } from "rxjs/Subscription";

import { Pdv } from '../../models/pdv'
import { User } from '../../models/user';

import { CameraProvider } from '../../providers/camera/camera';
import { UserProvider } from "../../providers/user/user";
import { ModalProvider } from '../../providers/modal/modal';

import { FunctionsUtil } from "../../util/functions.util";
import { Constants } from '../../environments/constants';

@IonicPage()
@Component({
  selector: 'page-pdv-empresa',
  templateUrl: 'pdv-empresa.html',
})
export class PdvEmpresaPage {

  modelPdv = 'PDV';

  selectOptions = {
    title: 'Modalidade',
    subTitle: 'Escolha sua modalidade de revendedor',
    mode: 'ios'
  };

  @ViewChild('fileUserPhoto') fileUserPhoto;

  public empresaForm: FormGroup;
  public user: User = new User()

  pdv: Pdv = new Pdv();
  subCurrentUser: any;
  subscription: Subscription = new Subscription();

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public FormBuilder: FormBuilder,
    public alertCtrl: AlertController,
    private cameraProvider: CameraProvider,
    private androidPermissions: AndroidPermissions,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    private events: Events,
    private userProvider: UserProvider,
    public modalProvider: ModalProvider,
    public actionSheetCtrl: ActionSheetController,
  ) {

    const emailRegex = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

    this.empresaForm = FormBuilder.group({
      Modalidade: ['', [Validators.required]],
      Rsocial: ['', [Validators.required, Validators.minLength(5)]],
      CNPJ: ['', [Validators.required]],
      InsMun: ['', [Validators.required]],
      Endereco: ['', [Validators.required, Validators.minLength(3)]],
      Cep: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      email: ['', Validators.pattern(emailRegex)],
      document: ['', Validators.required]
    })

  }

  ionViewCanEnter() {
    this.userProvider.getUserLocal().then(userID => {
      if (userID) {
        return true;
      }
    });
  }


  ionViewDidLoad() {
    this.userProvider.getUserLocal().then(userID => {
      if (userID != null) {
        this.subCurrentUser = this.userProvider.byId(userID).subscribe((user: User) => {
          this.user = new User(user);
        });
      }
    });
  }

  ionViewDidEnter() { }

  ionViewWillLeave() {
    this.subscription.add(this.subCurrentUser);
    this.subscription.unsubscribe();
  }

  hasPhoto() {
    const doc = this.empresaForm.value.document;
    return doc && doc.length > 0;
  }

  createPDV() {
    let empresa = this.empresaForm.value
    let PDV = {
      empresa: {
        modalidade: empresa.Modalidade,
        rSocial: empresa.Rsocial,
        cnpj: empresa.CNPJ,
        insMun: empresa.InsMun,
        endereco: empresa.Endereco,
        cep: empresa.Cep,
        empPhone: empresa.phone,
        empEmail: empresa.email,
        documento: empresa.document,
      }
    }
    return PDV
  }


  showAlert(title: string, msg: string, type: string) {
    this.alertCtrl.create({
      title: title,
      message: msg,
      cssClass: type,
      buttons: [{
        text: 'Ok',
        cssClass: 'btn-ok',
      }]
    }).present()

  }

  selectPicture() {
    this.checkPermission()
    if (Camera['installed']()) {
      this.cameraProvider.openMedia('Abrir', this.actionSheetCtrl, (imageBase64) => {
        this.empresaForm.controls['document'].setValue(imageBase64)

      });
    } else {
      this.fileUserPhoto.nativeElement.click();
    }
  }

  processWebImageUserPhoto($event) {
    this.cameraProvider.processWebImage($event, (imageBase64, w, h) => {
      this.empresaForm.controls['document'].setValue(imageBase64);

    });
  }

  checkPermission() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA && this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
      .then((result) => {
        result.hasPermission ? '' : this.requestCameraPermission()
      })
      .catch(() => {
      })
  }


  requestCameraPermission() {
    const permissionModal = this.modalCtrl.create(Constants.PERMISSIONS_MODAL_PAGE.name, { fromPage: 'pdv-empresa' });
    permissionModal.present()
      .then(() => {
        this.modalProvider.setActive();
      })
      .catch((error) => {
        alert(error)
      });
  }


  continue() {
    let unmaskCnpj = FunctionsUtil.cleanBRMask(this.empresaForm.value.CNPJ)

    if (this.empresaForm.controls.Modalidade.invalid) {
      this.showAlert("Modalidade não selecionada", "Selecione um tipo de Modalidade", "")
    }
    else if (this.empresaForm.controls.Rsocial.invalid) {
      this.showAlert("Razao Social invalida", "Digite uma valor válido", "")
    }
    else if (!FunctionsUtil.checkCNPJ(unmaskCnpj)) {
      this.showAlert("CNPJ invalido", "Digite um CNPJ Valido", "")
    }
    else if (this.empresaForm.controls.InsMun.invalid) {
      this.showAlert("Inscricao Municipal Invalida", "Digite um valor valido", "")
    }
    else if (this.empresaForm.controls.Endereco.invalid) {
      this.showAlert("Endereco invalido", "Digite um valor valido", "")
    }
    else if (this.empresaForm.controls.Cep.invalid) {
      this.showAlert("Cep invalido", "Digite um valor valido", "")
    }
    else if (this.empresaForm.controls.phone.invalid) {
      this.showAlert("Cep telefone", "Digite um valor valido", "")
    }
    else if (this.empresaForm.controls.email.invalid) {
      this.showAlert("email invalido", "Digite um valor valido", "")
    }

    else if (this.empresaForm.controls.document.invalid) {
      this.showAlert("arquivo invalido", "Selecione um arquivo", "")
    }

    else {
      const form = this.createPDV()
      this.pdv = new Pdv(form.empresa)
      //this.user.name = form.re.name
      this.user.pdvReg = this.pdv;
      //this.loadingCtrl.create({content:"Enviando Solicitacao"}).present()
      this.alertCtrl.create({
        title: "Confirmar solicitação?",
        message: "Sua solicitação será analisada pelos nossos consultores e em breve entraremos em contato com você. Deseja continuar?",
        buttons: [
          {
            text: 'Sim',
            cssClass: 'btn-ok',
            handler: () => {
              this.userProvider.saveUser(this.user)
              this.events.publish('user', this.user)
              this.navCtrl.setRoot(Constants.PRINCIPAL_PAGE.name)
            }
          },
          {
            text: 'Não',
            cssClass: 'btn-cancelar'
          }
        ]
      }).present()

    }

  }

}
