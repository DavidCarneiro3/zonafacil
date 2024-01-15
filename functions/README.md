**Firebase Functions - Dicas**

## COMANDOS GERAIS:

1 - firebase init functions
2 - cd functions
3 - npm install stripe --save
4 - firebase functions:config:set stripe.testekey="pk_test_jMIDE0GPO9sm28VUl7qMB2eF"
5 - firebase deploy --only functions

---

## COMANDO PARA O MUDAR O BANCO:

1 - Va em .firebaserc e altere o nome do projeto
2 - Comando para mudar o banco: $ firebase use --add
3 - Execute para mandar o codigo para o firebase cloud functions
```bash
  $ firebase deploy --only functions
  $ firebase deploy --only functions:calculaVagasEstacionadas
```

---

## Referências 

https://firebase.google.com/docs/cli/?hl=pt-br
https://firebase.google.com/docs/functions/get-started?hl=pt-br
https://firebase.google.com/docs/functions/database-events?hl=pt-br
https://firebase.google.com/docs/functions/beta-v1-diff#realtime-database
https://firebase.google.com/docs/admin/setup?hl=pt-br
https://dashboard.stripe.com/account/apikeys
