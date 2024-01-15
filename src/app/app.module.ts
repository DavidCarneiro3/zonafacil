// ANGULAR AND IONIC 
import { CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from "@angular/common/http";
import { AngularFireAuthModule } from "angularfire2/auth";
import { TextMaskModule } from 'angular2-text-mask';
import { AngularFireModule } from "angularfire2";
import { AngularFireDatabaseModule } from "angularfire2/database";
import { UniqueDeviceID } from "@ionic-native/unique-device-id";
import { IonicStorageModule } from "@ionic/storage";
import { StatusBar } from "@ionic-native/status-bar";
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SplashScreen } from "@ionic-native/splash-screen";
import { Camera } from "@ionic-native/camera";
import { Push } from "@ionic-native/push";
import { File } from "@ionic-native/file";
import { Uid } from '@ionic-native/uid';
import { AndroidPermissions } from "@ionic-native/android-permissions";
import { Geolocation } from "@ionic-native/geolocation";
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { SocialSharing } from '@ionic-native/social-sharing';
import { HTTP } from '@ionic-native/http';
import { CardIO } from '@ionic-native/card-io';
import { FileOpener } from '@ionic-native/file-opener'
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { Clipboard } from '@ionic-native/clipboard';
import { BrMaskerModule } from 'brmasker-ionic-3';
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { NamePatternPipe } from "../pipes/name-pattern/name-pattern";

// PROVIDERS
import { PagamentosProvider } from '../providers/pagamentos/pagamentos';
import { VeiculosProvider } from '../providers/veiculos/veiculos';
import { EstacionarProvider } from '../providers/estacionar/estacionar';
import { PagarmeProvider } from '../providers/pagarme/pagarme';
import { AuthProvider } from "../providers/auth/auth";
import { UserProvider } from "../providers/user/user";
import { CameraProvider } from "../providers/camera/camera";
import { SetoresProvider } from "../providers/setores/setores";
import { AreaProvider } from "../providers/area/area";
import { CreditosProvider } from '../providers/creditos/creditos';
import { CadsUserProvider } from '../providers/cads-user/cads-user';
import { CadsProvider } from '../providers/cads/cads';
import { ConsultarPlacaProvider } from '../providers/consultar-placa/consultar-placa';
import { HolidaysProvider } from '../providers/holidays/holidays';
import { BrowserProvider } from '../providers/browser/browser';
import { NotificationProvider } from '../providers/notification/notification';
import { ComunicacaoCentralProvider } from '../providers/comunicacao-central/comunicacao-central';
import { LoggerProvider } from '../providers/logger/logger';
import { ModalProvider } from '../providers/modal/modal';
import { CieloProvider } from '../providers/cielo/cielo';
import { InfoProvider } from '../providers/info/info';
import { ReportarProblemaProvider } from '../providers/reportar-problema/reportar-problema';
import { TempoEstacionadoProvider } from '../providers/tempo-estacionado/tempo-estacionado';
import { FirebaseLoggerProvider } from '../providers/firebase-logger/firebase-logger';



// MODULES 
import { PipesModule } from './../pipes/pipes.module';
import { ComponentsModule } from "../components/components.module";
import { TimerModule } from "../components/timer/timer.module";
import { AccordionModule } from "../components/accordion/accordion.module";
import { LoadingSpinnerComponentModule } from '../components/loading-spinner/loading-spinner.module';
import { ProgressBarModule } from "../components/progress-bar/progress-bar.module";


import { MyApp } from './app.component';
import { environment } from '../environments/environment';




@NgModule({
    declarations: [
        MyApp,
        NamePatternPipe
        
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        IonicModule.forRoot(MyApp, {
            // mode: 'ios',
            backButtonText: '',
            platforms: {
                ios: {
                    backButtonText: '',
                }
            },
            monthNames: ['janeiro', 'fevereiro', 'mar\u00e7o', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
            monthShortNames: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
            dayNames: ['domingo', 'segunda-feira', 'ter\u00e7a-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 's\u00e1bado'],
            dayShortNames: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
        }),
        AngularFireModule.initializeApp(environment.production ? environment.prod : environment.dev),
        AngularFireDatabaseModule,
        AngularFireAuthModule,
        TextMaskModule,
        TimerModule,
        ProgressBarModule,
        ComponentsModule,
        LoadingSpinnerComponentModule,
        AccordionModule,
        IonicStorageModule.forRoot(),
        BrMaskerModule,
        PipesModule,
        
        
    ],
    
    exports: [TextMaskModule,NamePatternPipe],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        
    ],
    providers: [
        StatusBar,
        SplashScreen,
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        LoggerProvider,
        Camera,
        Push,
        HTTP,
        File,
        UniqueDeviceID,
        FileOpener,
        Uid,
        AndroidPermissions,
        Geolocation,
        LocationAccuracy,
        InAppBrowser,
        AuthProvider,
        UserProvider,
        CameraProvider,
        PagamentosProvider,
        VeiculosProvider,
        SetoresProvider,
        AreaProvider,
        EstacionarProvider,
        PagarmeProvider,
        CreditosProvider,
        CadsUserProvider,
        CadsProvider,
        TempoEstacionadoProvider,
        BrowserProvider,
        NotificationProvider,
        InfoProvider,
        ComunicacaoCentralProvider,
        SocialSharing,
        FirebaseLoggerProvider,
        ModalProvider,
        ReportarProblemaProvider,
        CardIO,
        SpeechRecognition,
        CieloProvider,
        Clipboard,
        ConsultarPlacaProvider,
        HolidaysProvider
    ]
})
export class AppModule {
}
