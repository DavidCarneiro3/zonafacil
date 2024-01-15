**Zona Fácil**

Construção e gestão do desenvolvimento do aplicativo de estacionamento zona azul.


---

## Conta do GMail
```
**email**: zonaazulfortaleza@gmail.com
**senha**: Nec4va#2018@3p5
```
---

## Conta do Apple Developer
```
**email**: zonaazulfortaleza@gmail.com
**senha**: Zonaazulfortaleza@321
**senha app**: pjgu-leih-ogkn-xiqr
```
---

## Conta de Acesso ao Sistema
```
**email**: zonaazulfortaleza@gmail.com
**senha**: 123456
```
---

## COMANDOS

```bash
$ npm install -g ionic cordova
$ ionic start smartiriweb sidemenu
$ ionic generate page home
$ ionic generate provider home
$ ionic generate pipe StringToDate
$ ionic serve -lcs
$ ionic serve --port 8100 --livereload-port 35729 --dev-logger-port 53703 -c
$ npm i -g ionic@3.19.1
$
```

---


## VERSAO

```bash
$ node - v6.13.0
$ android - v7.1
$ ionic -v3.19.1
$ cordova -v7.1
$ npm i -g ionic@3.19.1
$ curl -s "https://get.sdkman.io" | bash ## Install sdk 
$ skd install gradle 4.6 
```

---

## EXECUCAO

```bash
$ ionic cordova platform add ios
$ ionic cordova platform add android@6
$ ionic cordova run android --target=RQ8N307V5ZD --prod
$ ionic cordova run ios --target=87ca7435cb02ea2ffeff6d10b44b9f3132642ac6
$ ionic cordova run browser
```

---

## BUILD PARA MOBILE

```bash
$ ionic cordova build android --release --prod
$ ionic cordova build ios --release --prod
```

---

## BUILD PARA WEB COM PLUGINS CORDOVA

```bash
$ ionic cordova platform add browser --save
$ ionic cordova build browser --release --prod
```

---

## BUILD PARA WEB
```bash
$ npm run build --prod
```

---

## DEPLOY PARA O FIREBASE HOSTING
```bash
$ npm install -g firebase-tools
$ firebase login
$ firebase init
$ firebase deploy
$ firebase use --add smartiriapp
```

---

## Otimizar imagens
https://tinypng.com/

---

## FONTES

1. Acesse o [site](https://icomoon.io/app)
2. Importe os arquivos SVG
3. Selecione todos
4. Selecione as configurações conforme a imagem font-conf.png na pasta extra do projeto
5. Clique em "Generate Font F"
6. Clique em "Download"
7. Copie as fontes para a pasta do projeto: assets/fonts
8. Importe os arquivos icomoon.ionicons.scss e icomoon.scss no arquivo variables.scss
9. Para montar o arquivo icomoon.ionicons.scss, verifique o style.css gerado pelo site

---

## FACEBOOK

```bash
# Gerar keystore para o projeto
keytool -genkey -v -keystore extra/smartiriapp.keystore -alias smartiriapp -keyalg RSA -validity 10000
# senha: smartiriapp@123

# Visualizar a hash da keystore e inserir no facebook developers
keytool -exportcert -alias smartiriapp -keystore extra/smartiriapp.keystore | openssl sha1 -binary | openssl base64
# aXQa2k5VDLSKc2+mZxm0n7FBHNo=
# De1vEsKjLxhep+owUoKWfAM83s0=
# hash da keystore debug (Windows Gabriel Trab): Hfp6MV76iqMPGEyLH2QoQWVVkMg=
# hash da keystore debug (Windows Gabriel Mac): iVhYI9KbVC5UT/Ku3XjMpkGeZk4=

ionic cordova plugin add cordova-plugin-facebook4 --variable APP_ID="133124344124758" --variable APP_NAME="smartiriapp"
npm install --save @ionic-native/facebook
```

---

## Referências

[Split Pane - Implementação](http://masteringionic.com/blog/2017-04-01-implementing-the-ionic-splitpane-component/)
[Split Pane - Ionic Oficial](https://ionicframework.com/docs/api/components/split-pane/SplitPane/)
[Split Pane - Ionic Blog](http://blog.ionicframework.com/ionic-2-2-0-is-out/)
[Telas Responsivas - Grid](http://blog.ionicframework.com/build-awesome-desktop-apps-with-ionics-new-responsive-grid/)
[Telas Desktop - Ionic Oficial](https://ionicframework.com/docs/developer-resources/desktop-support/)
[Locale PT-BR - Angular](https://github.com/angular/angular/issues/20197)
[Subscription](https://stackoverflow.com/questions/38008334/angular-rxjs-when-should-i-unsubscribe-from-subscription)


## Dados do cartão de crédito

---
    Numero 5582 3612 6636 6112
    Validade 12/2020
    CCV 734
    Nome ZONA FÁCIL DEV
    CPF 661.187.870-00
---


## CALENDAR API
[API USADO PARA CRIAR OS FERIADOS NO FIREBASE](https://api.calendario.com.br/?json=true&token=c3Vwb3J0ZUB6b25hZmFjaWwuY29tLmJyJmhhc2g9MjQxMTQ1NDM4&ano=2019&estado=CE`)

## Problema identificado:
[Referencia](https://forum.ionicframework.com/t/could-not-find-play-services-basement-aar-com-google-android-gms-play-services-basement/145529/2)

## Google Service Version Problem 
[Ionic-Form](https://forum.ionicframework.com/t/error-push-plugin-class-com-google-gms-googleservices-googleservicesplugin/105545/6)

platforms/android/project.properties
# cordova.system.library.7=com.google.firebase:firebase-messaging:11.8.0
#cordova.system.library.3=com.google.android.gms:play-services-location:11.8.0
#Tem que ser a mesma versao

<!-- <string name="google_api_key">@string/google_api_key</string> -->
<!-- <string name="google_app_id">@string/google_app_id</string> -->

AppleID 
6D75KDGD6T.br.com.zonafacil.for


https://firebase.google.com/docs/reference/ios/firebasemessaging/api/reference/Protocols/FIRMessagingDelegate#/c:objc(pl)FIRMessagingDelegate(im)messaging:didReceiveMessage:

##  pdv's cadastrados
    35 77