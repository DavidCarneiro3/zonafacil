import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular'
import { SocialSharing } from '@ionic-native/social-sharing'
import { CadsProvider } from '../../providers/cads/cads'
import { CadModel } from '../../models/cad'
import { BrowserProvider } from '../../providers/browser/browser'

@IonicPage()
@Component({
  selector: 'page-compartilhar',
  templateUrl: 'compartilhar.html',
})
export class CompartilharPage {

  cad = new CadModel();

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private socialSharing: SocialSharing,
    private cadsProvider: CadsProvider,
    private browserProvider: BrowserProvider,
    private loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    this.cadsProvider.find().take(1).subscribe(value => {
      value.map(item => {
        this.cad = new CadModel(item.cad);
      });
    });
  }

  shareLink() {
    const url = 'http://www.zonafacil.com.br';
    this.browserProvider.openPage(url);
  }

  shareFacebook() {
    let loading = this.loadingCtrl.create({ content: 'Aguarde...' });
    loading.present();

    const message = 'O Zona Fácil é meu aplicativo Zona Azul preferido. Indico!';
    const img = 'https://www.zonafacil.com.br/site/images/mockups/banner-1.jpg';
    const url = 'https://www.zonafacil.com.br';

    this.socialSharing.shareViaFacebook(message, img, url)
      .then(() => {
        loading.dismiss();
      })
      .catch(e => {
        console.error('error', e)
        loading.dismiss();
       });
  }

  shareWhatsapp() {
    let loading = this.loadingCtrl.create({ content: 'Aguarde...' });
    loading.present();

    const message = 'O Zona Fácil é meu aplicativo Zona Azul preferido. Indico!';
    const img = 'https://www.zonafacil.com.br/site/images/mockups/banner-1.jpg';
    const url = 'https://www.zonafacil.com.br';
    this.socialSharing.shareViaWhatsApp(message, img, url)
      .then(() => {
        loading.dismiss();
      })
      .catch(e => {
        console.error('error', e)
        loading.dismiss();
      });
  }

  share() {
    const loading = this.loadingCtrl.create({ content: 'Aguarde...' });
    loading.present();

    const subject = 'Zona Azul!';
    const message = 'O Zona Fácil é meu aplicativo Zona Azul preferido. Indico!';
    const img = 'https://www.zonafacil.com.br/site/images/mockups/banner-1.jpg';
    const url = 'https://www.zonafacil.com.br';

    this.socialSharing.share(message, subject, img, url)
      .then(() => {
        loading.dismiss();
      })
      .catch(e => {
        console.error('error', e);
        loading.dismiss(); 
      });
  }

}
