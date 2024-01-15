export const environment = {

    cielo: false,
    production: true,
    simular_l2: false,
    isDebugMode: true,
    version: "2.0.0",

    middleware_cors: 'https://us-central1-zonaazulfortaleza-prod.cloudfunctions.net/requisicao_amc',


    dev: {
        apiKey: "AIzaSyD0LQ-V04mrcdgPfOzkd01vkUcEAzmgDBA",
        authDomain: "zonaazulfortaleza-temp.firebaseapp.com",
        databaseURL: "https://zonaazulfortaleza-temp.firebaseio.com",
        projectId: "zonaazulfortaleza-temp",
        storageBucket: "zonaazulfortaleza-temp.appspot.com",
        messagingSenderId: "699166518123"
    },
    prod: {
        apiKey: "AIzaSyBnFP7PFiWgUX3kKl5RBx6LGuaAGs4aRPc",
        authDomain: "zonaazulfortaleza-prod.firebaseapp.com",
        databaseURL: "https://zonaazulfortaleza-prod.firebaseio.com",
        projectId: "zonaazulfortaleza-prod",
        storageBucket: "zonaazulfortaleza-prod.appspot.com",
        messagingSenderId: "722683236957"
    },

    cieloDev: {
        merchantId: 'e0b693cf-4734-465e-bfc8-83b1985e1dcf',
        merchantKey: 'QFROPTJJCGHJNZTATOBLMVXQFUMKLRMUYWIDRFXN',
        apiUrl: 'https://apisandbox.cieloecommerce.cielo.com.br',
        apiQueryUrl: 'https://apiquerysandbox.cieloecommerce.cielo.com.br'
    },
    cieloProd: {
        merchantId: '5e15d350-7701-4bcc-b08e-72dc473686ce',
        merchantKey: 'n0kbhlvF92sj2vgtvJJUFHcUJOe5qnn0xgnvvNOy',
        apiUrl: 'https://api.cieloecommerce.cielo.com.br',
        apiQueryUrl: 'https://apiquery.cieloecommerce.cielo.com.br'
    }
};