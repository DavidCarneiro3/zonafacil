const functions = require('firebase-functions');
const admin = require('firebase-admin');
const btoa = require('btoa');
const nodemailer = require('nodemailer');

const Utils = require('./util/utils.js');

const KMZ = require('kmz-geojson');
const NodeGeodecoder = require('node-geocoder');
const GeodecoderOptions = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: 'AIzaSyAUTZetABHq84mkWy3PeuEcFqu31XAQPjs',
    formatter: null
};
//Usado para  obter os bairros através das coordenadas
const GEODECODER = NodeGeodecoder(GeodecoderOptions);



// LINK DA AMC DEV
// COD CLIENTE DEV 
const URL_CENTRAL = `https://wszonaazuldsv.centralamc.com.br/transacao`;
const COD_CLIENTE = 75;

// LINK DA AMC PROD
// COD CLIENTE PROD

// const URL_CENTRAL = `https://wszonaazulprd.centralamc.com.br/transacao`;
// const COD_CLIENTE = 82;

// admin.initializeApp({
//     credential: admin.credential.applicationDefault(),
//     databaseURL: 'https://zonaazulfortaleza-temp.firebaseio.com',
//     // databaseURL: 'https://zonaazulfortaleza-prod.firebaseio.com'
// });

admin.initializeApp();

const TRINTA_MIN = 30 * 60 * 1000;
const VINT25_MIN = 25 * 60 * 1000;
const VINTE_MIN = 20 * 60 * 1000;
const QUINZE_MIN = 15 * 60 * 1000;
const DEZ_MIN = 10 * 60 * 1000;
const CINCO_MIN = 5 * 60 * 1000;
const LIMITE_MIN = (60 * 1000) - 1;
const url_base = `ce/fortaleza/2018`;





const http = require("https");
const cors = require('cors')({ origin: true });

/**
 * URL da requisicao:
 * https://us-central1-zonaazulfortaleza-prod.cloudfunctions.net/requisicao_amc
 * https://us-central1-zonaazulfortaleza-prod.cloudfunctions.net/requisicao_amc?url=1&body=2&headers=3
 * https://us-central1-zonaazulfortaleza-prod.cloudfunctions.net/requisicao_amc?url=https://wszonaazulprd.centralamc.com.br/transacao&body="\n    <transacao>\n      <codigoDistribuidor>82</codigoDistribuidor>\n      <dataEnvio>2019-04-26T19:44:56</dataEnvio>\n      <tipo>1</tipo>\n      <idTransacaoDistribuidor>1540535637</idTransacaoDistribuidor>\n      <cnpj>05591991000148</cnpj>\n      <quantidadeCartoes>1</quantidadeCartoes>\n    </transacao>\n    "&headers={"authorization":"Basic ODI6NTJhMWY1MTljM2M4MjQwODRhNDk1ZTYxZWM2ZTk3ZmI=","content-type":"application/xml"}
 * 
 * https://github.com/mkatsoho/node-rest-client-alt
 * https://medium.com/@lgvalle/as-a-software-engineer-building-android-apps-i-inevitably-run-into-problems-with-server-apis-not-d28b25451507
 * https://ilikekillnerds.com/2017/05/enabling-cors-middleware-firebase-cloud-functions/
 * 
 */
exports.requisicao_amc = functions.https.onRequest((req, res) => {
    const q = req.query;

    if (q) {

        const _url = q.url;
        const _body = q.body;
        const _headers = JSON.parse(q.headers);

        Utils.sendPost(_url, _body, _headers,
            function (response) {
                cors(req, res, () => {
                    res.status(200).send(response)
                });
            }, function (error) {
                cors(req, res, () => {
                    res.status(200).send(error)
                });
            }
        );

    } else {
        const resposta = `
        <?xml version="1.0"?>
        <Resultado>
            <mensagem>ENVIE OS PARAMETROS OBRIGATORIOS</mensagem>
        </Resultado>
        `

        cors(req, res, () => {
            res.status(400).send(resposta.trim())
        });
    }

});


/**
 * Verifica os estacionamentos agendados e faz a requesição para a AMC para estacionar
 * URL DA REQUESIÇÃO => https://us-central1-zonaazulfortaleza-temp.cloudfunctions.net/estacionaAgendado
 */
exports.estacionaAgendado = functions
    .https.onRequest((request, response) => {
        const url_agendamento = `/agendamentos/${url_base}`;
        const auth = btoa(`${COD_CLIENTE}:${Utils.gerarCodigoAcesso(COD_CLIENTE)}`);
        const HEADERS = {
            'authorization': `Basic ${auth}`,
            'content-type': 'application/xml'
        }

        const promise = admin.database()
            .ref(url_agendamento)
            .once('value')

            .then(snapshot => {
                let agendados = [];
                snapshot.forEach(_snapshot => {
                    let item = _snapshot.val()
                    const { sucess } = item
                    if (!sucess) {
                        agendados.push(item);
                    }
                });

                return agendados
            })

            .then(agendados => {
                agendados.forEach(_agendado => {

                    const { hour, now } = Utils.generateDate()
                    // Manda uma requisição se a hora for certa
                    if (_agendado.time == parseInt(hour)) {
                        _agendado.dataEnvio = now;
                        const agendamentoID = _agendado.id;
                        const xml = Utils._makeXML(_agendado)

                        Utils.sendPost(`https://us-central1-zonaazulfortaleza-prod.cloudfunctions.net/requisicao_amc?url=${URL_CENTRAL}&body=${xml}&headers=${encodeURI(JSON.stringify(HEADERS))}`, '',
                            '',
                            function (response) {
                                response = Utils.parseHttpXmlResponse(response)
                                console.log(response)

                                const { sucesso } = response
                                if (sucesso) {

                                    const estacionado = Utils._makeComprovante(response, _agendado);
                                    const _item = { sucess: true }
                                    admin.database()
                                        .ref(`${url_agendamento}/${agendamentoID}`)
                                        .update(_item)


                                    admin.database().ref(`/estacionar/${url_base}/${_agendado.userID}/${estacionado.id}`)
                                        .update(estacionado)

                                } else {
                                    console.log('response false da AMC');
                                }
                            }, function (error) {
                                console.log(`algo deu errado , ${error}`);
                            }
                        )

                    }
                });
            });

        Promise.all([promise])
            .then(respo => {
                response.status(200).send(`Trigger realizando com sucesso`);
            })
            .catch(err => {
                response.status(500).send(`Erro executando a function ${err}`);
            })
    })

/**
 * URL da requisicao:
 * https://us-central1-zonaazulfortaleza-prod.cloudfunctions.net/checaEstacionamento
 * 
 */
exports.checaEstacionamento = functions.https.onRequest((req, res) => {
    const url_estacionar = `/estacionar/${url_base}`;

    const promise1 = admin.database()
        .ref(url_estacionar)
        .once("value")

        .then(snapshot => {
            let arr = [];
            snapshot.forEach(_snapshot => {
                let _item = _snapshot.val();
                Object.keys(_item).forEach(key => _item[key].user_id = _snapshot.key); // salva o id do usuario no obj estacionamento
                arr.push(_item);
            });
            return arr;
        })

        .then(arr => {

            arr.forEach(_dtHoraObj => {
                Object.keys(_dtHoraObj).forEach(key => {
                    let _dtHoraVal = _dtHoraObj[key];

                    if (_dtHoraVal.status === true) { // Somente os veiculos que estao estacionados no momento
                        const offset = -3; // realiza o timezone para obter a hora no brasil
                        const dataHoraRegistro = new Date(Date.now() + (3600000 * offset));
                        const dataHoraFim = new Date(_dtHoraVal.tempoEstacionado + (3600000 * offset));
                        const { user_id, comprovante, tempoComprado, qtd } = _dtHoraVal;
                        let podeRenovar = true

                        console.log('executando checkEstacionamento');
                        podeRenovar = tempoComprado !== 300 && qtd !== 2
                        const renovar = podeRenovar ? ', com a possibilidade de renovação!' : ', sem a possibilidade de renovação!'

                        const diff = dataHoraFim.getTime() - dataHoraRegistro.getTime();


                        if (diff >= TRINTA_MIN && diff <= (TRINTA_MIN + LIMITE_MIN)) {
                            console.log('faltando 30');
                            sendPushNotification(_dtHoraVal.user_id, url_base, '30 minutos restantes', `Faltam 30 minutos para expirar seu tempo de estacionamento ${renovar}`, 30);
                        }
                        else if (diff >= VINT25_MIN && diff <= (VINT25_MIN + LIMITE_MIN)) {
                            console.log('faltando 25');
                            sendPushNotification(_dtHoraVal.user_id, url_base, '25 minutos restantes', `Faltam 25 minutos para expirar seu tempo de estacionamento ${renovar}`, 25);
                        }
                        else if (diff >= VINTE_MIN && diff <= (VINTE_MIN + LIMITE_MIN)) {
                            console.log('faltando 20');
                            sendPushNotification(_dtHoraVal.user_id, url_base, '20 minutos restantes', `Faltam 20 minutos para expirar seu tempo de estacionamento ${renovar}`, 20);
                        }
                        else if (diff >= QUINZE_MIN && diff <= (QUINZE_MIN + LIMITE_MIN)) {
                            console.log('faltando 15');
                            sendPushNotification(_dtHoraVal.user_id, url_base, '15 minutos restantes', `Faltam 15 minutos para expirar seu tempo de estacionamento ${renovar}`, 15);
                        } else if (diff >= DEZ_MIN && diff <= (DEZ_MIN + LIMITE_MIN)) {
                            console.log('faltando 10');
                            sendPushNotification(_dtHoraVal.user_id, url_base, '10 minutos restantes', `Faltam 10 minutos para expirar seu tempo de estacionamento ${renovar}`, 10);

                        } else if (diff >= CINCO_MIN && diff <= (CINCO_MIN + LIMITE_MIN)) {
                            console.log('faltando 5');
                            sendPushNotification(_dtHoraVal.user_id, url_base, '5 minutos restantes', `Faltam 5 minutos para expirar seu tempo de estacionamento ${renovar}`, 5);

                        } else if (diff <= 0) {

                            sendPushNotification(_dtHoraVal.user_id, url_base, 'Tempo encerrado', 'Seu tempo de estacionamento acabou. Retire seu veículo pois ele se encontra em situação irregular e poderá ser autuado', 0);

                            const _item = { status: false };

                            admin.database()
                                .ref(`${url_estacionar}/${_dtHoraVal.user_id}/${key}`)
                                .update(_item);
                        }
                    }
                })
            })

            return arr;
        });

    res.set('Acess-Control-Allow-Origin', '*')
    Promise.all([promise1]).then((response) => {
        res.status(200).send(`Trigger realizada com sucesso ${new Date(Date.now())} `);
    })
        .catch(error => {
            res.status(500).send(`Algo deu errado ${error}`);
        });
});

exports.checaEstacionamento2 = functions.pubsub.schedule('* * * * *').onRun((context) => {
    const url_estacionar = `/estacionar/${url_base}`;

    const promise1 = admin.database()
        .ref(url_estacionar)
        .once("value")

        .then(snapshot => {
            let arr = [];
            snapshot.forEach(_snapshot => {
                let _item = _snapshot.val();
                Object.keys(_item).forEach(key => _item[key].user_id = _snapshot.key); // salva o id do usuario no obj estacionamento
                arr.push(_item);
            });
            return Promise.all(arr);
        })

        .then(arr => {

            arr.forEach(_dtHoraObj => {
                Object.keys(_dtHoraObj).forEach(key => {
                    let _dtHoraVal = _dtHoraObj[key];

                    if (_dtHoraVal.status === true) { // Somente os veiculos que estao estacionados no momento
                        const offset = -3; // realiza o timezone para obter a hora no brasil
                        const dataHoraRegistro = new Date(Date.now() + (3600000 * offset));
                        const dataHoraFim = new Date(_dtHoraVal.tempoEstacionado + (3600000 * offset));
                        const { user_id, comprovante, tempoComprado, qtd } = _dtHoraVal;
                        let podeRenovar = true

                        console.log('executando checkEstacionamento');
                        podeRenovar = tempoComprado !== 300 && qtd !== 2
                        const renovar = podeRenovar ? ', entre no app e faça sua renovação.' : ''

                        const diff = dataHoraFim.getTime() - dataHoraRegistro.getTime();


                        if (diff >= TRINTA_MIN && diff <= (TRINTA_MIN + LIMITE_MIN)) {
                            console.log('faltando 30');
                            sendPushNotification(_dtHoraVal.user_id, url_base, '30 minutos restantes', `Faltam 30 minutos para encerrar seu tempo de estacionamento${renovar}`, 30);
                        }
                        else if (diff >= VINT25_MIN && diff <= (VINT25_MIN + LIMITE_MIN)) {
                            console.log('faltando 25');
                            sendPushNotification(_dtHoraVal.user_id, url_base, '25 minutos restantes', `Faltam 25 minutos para encerrar seu tempo de estacionamento${renovar}`, 25);
                        }
                        else if (diff >= VINTE_MIN && diff <= (VINTE_MIN + LIMITE_MIN)) {
                            console.log('faltando 20');
                            sendPushNotification(_dtHoraVal.user_id, url_base, '20 minutos restantes', `Faltam 20 minutos para encerrar seu tempo de estacionamento${renovar}`, 20);
                        }
                        else if (diff >= QUINZE_MIN && diff <= (QUINZE_MIN + LIMITE_MIN)) {
                            console.log('faltando 15');
                            sendPushNotification(_dtHoraVal.user_id, url_base, '15 minutos restantes', `Faltam 15 minutos para encerrar seu tempo de estacionamento${renovar}`, 15);
                        } else if (diff >= DEZ_MIN && diff <= (DEZ_MIN + LIMITE_MIN)) {
                            console.log('faltando 10');
                            sendPushNotification(_dtHoraVal.user_id, url_base, '10 minutos restantes', `Faltam 10 minutos para encerrar seu tempo de estacionamento${renovar}`, 10);

                        } else if (diff >= CINCO_MIN && diff <= (CINCO_MIN + LIMITE_MIN)) {
                            console.log('faltando 5');
                            sendPushNotification(_dtHoraVal.user_id, url_base, '5 minutos restantes', `Faltam 5 minutos para encerrar seu tempo de estacionamento${renovar}`, 5);

                        } else if (diff <= 0) {

                            sendPushNotification(_dtHoraVal.user_id, url_base, 'Tempo encerrado', 'Seu tempo de estacionamento acabou. Retire seu veículo para evitar infração.', 0);

                            const _item = { status: false };

                            admin.database()
                                .ref(`${url_estacionar}/${_dtHoraVal.user_id}/${key}`)
                                .update(_item);
                        }
                    }
                })
            })

            return Promise.all(arr);
        });
        
/*
    context.set('Acess-Control-Allow-Origin', '*')
    Promise.all([promise1]).then((response) => {
        res.status(200).send(`Trigger realizada com sucesso ${new Date(Date.now())} `);
    })
        .catch(error => {
            res.status(500).send(`Algo deu errado ${error}`);
        });
        */
});

exports.getSetoresAMC = functions.https.onRequest((req, res) => {
    const UrlDoKmzDaAmc = 'http://cmaremoto.ddns.net/zonaazul/zonaazul.kmz';
    res.set('Access-Control-Allow-Origin', '*') // CrossOrigin Error 

    let todosSetores;

    getZonas(UrlDoKmzDaAmc).then(result => {
        console.log(result)
        todosSetores = result;
        res.status(200).send(todosSetores)
    }).catch(err => {
        console.log(err)
        res.status(401).send(err)
    })
});

function getZonas(URL) {
    return new Promise((resolve, reject) => {
        let todosSetores = [];
        let stepPromises = [];

        KMZ.toGeoJSON(URL, function (eror, response) {
            if (eror) throw 'Erro Conectando ao Servidor da AMC';
            Object.keys(response.features).forEach(setor => {
                stepPromises.push(
                    GEODECODER.reverse({ lat: (response.features[setor].geometry.coordinates[0][1]).toFixed(6), lon: (response.features[setor].geometry.coordinates[0][0]).toFixed(6) }) //mesmo erro....
                )
            })
            Promise.all(stepPromises)
                .then((result) => {
                    response.features.forEach((zona, index) => {
                        let bairro = result[index][0].extra.neighborhood.toUpperCase();
                        bairro = bairro.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
                        todosSetores.push(criarJson(zona, bairro))
                    })
                    console.log('out of foreach')
                    resolve(todosSetores)
                })
                .catch((erro) => {
                    return erro
                })
        }), reject
    })

}

function criarJson(zona, bairro) {
    var todosDias = null
    var diasUteis = null
    var diasUteisESabado = null
    var hora_inicio = null
    var hora_fim = null
    var horaInicioSabado = null
    var horaFimSabado = null
    var diasUteisSabadoDomingo = null

    var dados = {};

    var nomeRua = zona.properties.name.toUpperCase();
    nomeRua = nomeRua.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase()
    var latInicio = zona.geometry.coordinates[0][1];
    var latFim = zona.geometry.coordinates[zona.geometry.coordinates.length - 1][1];
    var lngInicio = zona.geometry.coordinates[0][0];
    var lngFim = zona.geometry.coordinates[zona.geometry.coordinates.length - 1][0];

    var vagasConvencionais = zona.properties.description.substr((zona.properties.description.indexOf("Vagas convecionais: ") + "Vagas convecionais: ".length), 3);
    var vagasCargasDescarga = zona.properties.description.substr((zona.properties.description.indexOf("Vagas Carga e descarga: ") + "Vagas Carga e descarga: ".length), 3);
    var vagasIdosos = zona.properties.description.substr((zona.properties.description.indexOf("Vagas Idoso: ") + "Vagas Idoso: ".length), 3);
    var vagasDeficiente = zona.properties.description.substr((zona.properties.description.indexOf("Vagas Def. Físico:") + "Vagas Def. Físico:".length), 3);

    var cadVeiculo = zona.properties.description.substr((zona.properties.description.indexOf("Permanência: ") + "Permanência: ".length), 1) * 60;
    isNaN(cadVeiculo) ? cadVeiculo = 5 * 60 : ''

    var horario = zona.properties.description.substring(zona.properties.description.indexOf('Horário: ')).split(/\r?\n/);
    horario = horario[0];

    if (horario.length === 14) {
        todosDias = horario.substring(horario.indexOf(':') + 2)
        todosDias = todosDias.split('-')
        hora_inicio = parseInt(todosDias[0], 10) < 10 ? '0' + parseInt(todosDias[0], 10) + ':00' : parseInt(todosDias[0], 10) + ':00'
        hora_fim = parseInt(todosDias[1], 10) + ':00'

    } else if (horario.length === 25) {
        horario = horario.toLowerCase()
        diasUteis = horario.substring(horario.indexOf('úteis') + 'úteis'.length)
        diasUteis = diasUteis.split('-')
        hora_inicio = parseInt(diasUteis[0], 10) < 10 ? '0' + parseInt(diasUteis[0], 10) + ':00' : parseInt(diasUteis[0], 10) + ':00'
        hora_fim = parseInt(diasUteis[1], 10) + ':00'
    } else if ((horario.length === 41 || horario.length === 36 || horario.length === 40 || horario.length === 39 || horario.length === 34 || horario.length === 35) && !(horario.indexOf('domingo') != -1)) {

        horario = horario.toLowerCase()
        horario = horario.substring('horários: dias úteis'.length)
        horario = horario.split(',')
        if (horario.length > 1) {
            var todosHorarios = horario
            diasUteisESabado = todosHorarios[0].split('-')
            hora_inicio = diasUteisESabado[0] < 10 ? '0' + diasUteisESabado[0] : diasUteisESabado[0]
            hora_inicio = hora_inicio + ':00'

            hora_fim = parseInt(diasUteisESabado[1], 10)
            hora_fim = hora_fim + ':00'

            var sabados = todosHorarios[1]
            sabados = sabados.substring(' sabados '.length)
            sabados = sabados.split('-')
            horaInicioSabado = parseInt(sabados[0], 10) < 10 ? '0' + parseInt(sabados[0], 10) : String(parseInt(sabados[0], 10))
            horaInicioSabado = horaInicioSabado + ':00'
            horaFimSabado = String(parseInt(sabados[1], 10))
            horaFimSabado = horaFimSabado + ':00'

        } else {
            horario = String(horario[0]).toLowerCase()
            diasUteisESabado = horario
            var todashoras = horario.match(/^\d+|\d+\b|\d+(?=\w)/g);
            if (todashoras.length === 2) {
                hora_inicio = parseInt(todashoras[0], 10) < 10 ? '0' + parseInt(todashoras[0], 10) + ':00' : parseInt(todashoras[0], 10) + ':00'
                horaInicioSabado = hora_inicio
                hora_fim = parseInt(todashoras[1], 10) + ':00'
                horaFimSabado = hora_fim

            } else {
                hora_inicio = parseInt(todashoras[0], 10) < 10 ? '0' + parseInt(todashoras[0], 10) + ':00' : parseInt(todashoras[0], 10) + ':00'
                hora_fim = parseInt(todashoras[1]) + ':00'
                horaInicioSabado = parseInt(todashoras[2], 10) < 10 ? '0' + parseInt(todashoras[2], 10) + ':00' : parseInt(todashoras[2]) + ':00'
                horaFimSabado = parseInt(todashoras[3]) + ':00'

            }
        }
    } else {
        horario = horario.toLowerCase()
        if ((horario.indexOf('dias úteis') !== -1) && (horario.indexOf('domingos') !== -1) && (horario.indexOf('sábados') !== -1)) {
            diasUteisSabadoDomingo = horario.match(/^\d+|\d+\b|\d+(?=\w)/g);
            hora_inicio = parseInt(diasUteisSabadoDomingo[0], 10) < 10 ? '0' + parseInt(diasUteisSabadoDomingo[0], 10) + ':00' : parseInt(diasUteisSabadoDomingo[0], 10) + ':00'
            hora_fim = parseInt(diasUteisSabadoDomingo[1], 10) + ':00'

            horaInicioSabado = parseInt(diasUteisSabadoDomingo[2], 10) < 10 ? '0' + parseInt(diasUteisSabadoDomingo[2], 10) + ':00' : parseInt(diasUteisSabadoDomingo[2], 10) + ':00'
            horaFimSabado = parseInt(diasUteisSabadoDomingo[3], 10) + ':00'

            var horaInicioDomingo = parseInt(diasUteisSabadoDomingo[4], 10) < 10 ? '0' + parseInt(diasUteisSabadoDomingo[4], 10) + ':00' : parseInt(diasUteisSabadoDomingo[4], 10) + ':00'
            var horaFimDomingo = parseInt(diasUteisSabadoDomingo[5], 10) + ':00'

        } else {
            diasUteisSabadoDomingo = null
        }
    }
    if (todosDias) {
        dados = {
            "bairro": bairro,
            "cad_caminhao": 30,
            "cad_veiculo": cadVeiculo,
            "codigo": "",
            "isNew": false,
            "faces": {
                "01": {
                    "codigo": "01"
                }
            },
            "horario": {
                "domingo": {
                    "dia": "Domingo",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 0
                },
                "quarta": {
                    "dia": "Quarta",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 3
                },
                "quinta": {
                    "dia": "Quinta",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 4
                },
                "sabado": {
                    "dia": "Sábado",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 6
                },
                "segunda": {
                    "dia": "Segunda",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 1
                },
                "sexta": {
                    "dia": "Sexta",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 5
                },
                "terca": {
                    "dia": "Terça",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 2
                },
            },
            "latFim": latFim,
            "latInicio": latInicio,
            "lngFim": lngFim,
            "lngInicio": lngInicio,
            "nome": nomeRua,
            "qtd_carga_descarga_estacionados": 0,
            "qtd_deficiente_estacionados": 0,
            "qtd_idoso_estacionados": 0,
            "qtd_normal_estacionados": 0,
            "total_vagas": parseInt(vagasConvencionais, 10),
            "vagas_carga_descarga": parseInt(vagasCargasDescarga, 10),
            "vagas_deficiente": parseInt(vagasDeficiente, 10),
            "vagas_idoso": parseInt(vagasIdosos, 10)
        }
    } else if (diasUteis) {
        dados = {
            "bairro": bairro,
            "cad_caminhao": 30,
            "cad_veiculo": cadVeiculo,
            "codigo": "",
            "isNew": false,
            "faces": {
                "01": {
                    "codigo": "01"
                }
            },
            "horario": {
                "domingo": {
                    "dia": "Domingo",
                    "hora_fim": "00:00",
                    "hora_inicio": "00:00",
                    "isDisponivel": false,
                    "sequencial": 0
                },
                "quarta": {
                    "dia": "Quarta",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 3
                },
                "quinta": {
                    "dia": "Quinta",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 4
                },
                "sabado": {
                    "dia": "Sábado",
                    "hora_fim": "00:00",
                    "hora_inicio": "00:00",
                    "isDisponivel": false,
                    "sequencial": 6
                },
                "segunda": {
                    "dia": "Segunda",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 1
                },
                "sexta": {
                    "dia": "Sexta",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 5
                },
                "terca": {
                    "dia": "Terça",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 2
                },
            },
            "latFim": latFim,
            "latInicio": latInicio,
            "lngFim": lngFim,
            "lngInicio": lngInicio,
            "nome": nomeRua,
            "qtd_carga_descarga_estacionados": 0,
            "qtd_deficiente_estacionados": 0,
            "qtd_idoso_estacionados": 0,
            "qtd_normal_estacionados": 0,
            "total_vagas": parseInt(vagasConvencionais, 10),
            "vagas_carga_descarga": parseInt(vagasCargasDescarga, 10),
            "vagas_deficiente": parseInt(vagasDeficiente, 10),
            "vagas_idoso": parseInt(vagasIdosos, 10)

        }
    } else if (diasUteisESabado) {
        dados = {
            "bairro": bairro,
            "cad_caminhao": 30,
            "cad_veiculo": cadVeiculo,
            "codigo": "",
            "isNew": false,
            "faces": {
                "01": {
                    "codigo": "01"
                }
            },
            "horario": {
                "domingo": {
                    "dia": "Domingo",
                    "hora_fim": "00:00",
                    "hora_inicio": "00:00",
                    "isDisponivel": false,
                    "sequencial": 0
                },
                "quarta": {
                    "dia": "Quarta",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 3
                },
                "quinta": {
                    "dia": "Quinta",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 4
                },
                "sabado": {
                    "dia": "Sábado",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 6
                },
                "segunda": {
                    "dia": "Segunda",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 1
                },
                "sexta": {
                    "dia": "Sexta",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 5
                },
                "terca": {
                    "dia": "Terça",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 2
                },
            },
            "latFim": latFim,
            "lngInicio": lngInicio,
            "lngFim": lngFim,
            "latInicio": latInicio,
            "nome": nomeRua,
            "qtd_carga_descarga_estacionados": 0,
            "qtd_deficiente_estacionados": 0,
            "qtd_idoso_estacionados": 0,
            "qtd_normal_estacionados": 0,
            "total_vagas": parseInt(vagasConvencionais, 10),
            "vagas_carga_descarga": parseInt(vagasCargasDescarga, 10),
            "vagas_deficiente": parseInt(vagasDeficiente, 10),
            "vagas_idoso": parseInt(vagasIdosos, 10)

        }
    } else if (diasUteisSabadoDomingo) {
        dados = {
            "bairro": bairro,
            "cad_caminhao": 30,
            "cad_veiculo": cadVeiculo,
            "codigo": "",
            "isNew": false,
            "faces": {
                "01": {
                    "codigo": "01"
                }
            },
            "horario": {
                "domingo": {
                    "dia": "Domingo",
                    "hora_fim": horaFimDomingo,
                    "hora_inicio": horaInicioDomingo,
                    "isDisponivel": true,
                    "sequencial": 0
                },
                "quarta": {
                    "dia": "Quarta",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 3
                },
                "quinta": {
                    "dia": "Quinta",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 4
                },
                "sabado": {
                    "dia": "Sábado",
                    "hora_fim": horaFimSabado,
                    "hora_inicio": horaInicioSabado,
                    "isDisponivel": true,
                    "sequencial": 6
                },
                "segunda": {
                    "dia": "Segunda",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 1
                },
                "sexta": {
                    "dia": "Sexta",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 5
                },
                "terca": {
                    "dia": "Terça",
                    "hora_fim": hora_fim,
                    "hora_inicio": hora_inicio,
                    "isDisponivel": true,
                    "sequencial": 2
                },
            },
            "latFim": latFim,
            "latInicio": latInicio,
            "lngFim": lngFim,
            "lngInicio": lngInicio,
            "nome": nomeRua,
            "qtd_carga_descarga_estacionados": 0,
            "qtd_deficiente_estacionados": 0,
            "qtd_idoso_estacionados": 0,
            "qtd_normal_estacionados": 0,
            "total_vagas": parseInt(vagasConvencionais, 10),
            "vagas_carga_descarga": parseInt(vagasCargasDescarga, 10),
            "vagas_deficiente": parseInt(vagasDeficiente, 10),
            "vagas_idoso": parseInt(vagasIdosos, 10)

        }
    } else {
        dados = {
            "bairro": bairro,
            "cad_caminhao": 30,
            "cad_veiculo": cadVeiculo,
            "codigo": "",
            "isNew": false,
            "faces": {
                "01": {
                    "codigo": "01"
                }
            },
            "horario": {
                "domingo": {
                    "dia": "Domingo",
                    "hora_fim": "00:00",
                    "hora_inicio": "00:00",
                    "isDisponivel": true,
                    "sequencial": 0
                },
                "quarta": {
                    "dia": "Quarta",
                    "hora_fim": "00:00",
                    "hora_inicio": "00:00",
                    "isDisponivel": false,
                    "sequencial": 3
                },
                "quinta": {
                    "dia": "Quinta",
                    "hora_fim": "22:00",
                    "hora_inicio": "18:00",
                    "isDisponivel": true,
                    "sequencial": 4
                },
                "sabado": {
                    "dia": "Sábado",
                    "hora_fim": "22:00",
                    "hora_inicio": "18:00",
                    "isDisponivel": true,
                    "sequencial": 6
                },
                "segunda": {
                    "dia": "Segunda",
                    "hora_fim": "00:00",
                    "hora_inicio": "00:00",
                    "isDisponivel": false,
                    "sequencial": 1
                },
                "sexta": {
                    "dia": "Sexta",
                    "hora_fim": "22:00",
                    "hora_inicio": "18:00",
                    "isDisponivel": true,
                    "sequencial": 5
                },
                "terca": {
                    "dia": "Terça",
                    "hora_fim": "00:00",
                    "hora_inicio": "00:00",
                    "isDisponivel": false,
                    "sequencial": 2
                },
            },
            "latFim": latFim,
            "latInicio": latInicio,
            "lngFim": lngFim,
            "lngInicio": lngInicio,
            "nome": nomeRua,
            "qtd_carga_descarga_estacionados": 0,
            "qtd_deficiente_estacionados": 0,
            "qtd_idoso_estacionados": 0,
            "qtd_normal_estacionados": 0,
            "total_vagas": parseInt(vagasConvencionais, 10),
            "vagas_carga_descarga": parseInt(vagasCargasDescarga, 10),
            "vagas_deficiente": parseInt(vagasDeficiente, 10),
            "vagas_idoso": parseInt(vagasIdosos, 10)

        }
    }

    todosDias = null
    diasUteis = null
    hora_fim = null
    hora_inicio = null
    horaInicioSabado = null
    horaFimSabado = null
    diasUteisESabado = null
    diasUteisSabadoDomingo = null
    console.log(dados)
    return dados
}



function request(url) {
    return new Promise(function (fulfill, reject) {
        client.get(url, function (data, response) {
            fulfill(data)
        })
    })
}

function response(res, items, code) {
    res.set('Access-Control-Allow-Origin', '*');
    return res.status(code).send(items);
}

function sendPushNotification(idUser, _url, _title, _body, alerta) {
    const payload = {
        data: {
            title: _title,
            body: _body,
            image: 'icon'
        },
        notification: {
            title: _title,
            body: _body
        },
    };
    return admin.database()
        .ref(`/users/${_url}/${idUser}`)
        .once('value')
        .then(_userData => {
            const _user = _userData.val();

            const { notificationKey, name, configuracao } = _user;

            if (alerta === 30 && configuracao.alerta_30_minutos === true) {
                console.log('notificação de 30 minutos')
                return admin.messaging().sendToDevice(notificationKey, payload)
                    .then(response =>
                        console.log('response de 30 min', JSON.stringify(response))
                    )
                    .catch(err => console.log('erro de 30 min ', JSON.stringify(err)))
            }
            else if (alerta === 25 && configuracao.alerta_25_minutos === true) {
                console.log('notificação de 25 min')
                return admin.messaging().sendToDevice(notificationKey, payload)
                    .then(response =>
                        console.log('response de 25 min', JSON.stringify(response))
                    )
                    .catch(err => console.log('erro de 25 min ', JSON.stringify(err)))
            }
            else if (alerta === 20 && configuracao.alerta_20_minutos === true) {
                console.log('notificacao de 20 min')
                return admin.messaging().sendToDevice(notificationKey, payload)
                    .then(response =>
                        console.log('response de 20 min', JSON.stringify(response))
                    )
                    .catch(err => console.log('erro de 20 min ', JSON.stringify(err)))
            }
            else if (alerta === 15 && configuracao.alerta_15_minutos === true) {
                console.log('Notificacao de 15 minutos')
                return admin.messaging().sendToDevice(notificationKey, payload)
                    .then(response =>
                        console.log('response de 15 min', JSON.stringify(response))
                    )
                    .catch(err => console.log('erro de 15 min ', JSON.stringify(err)))
            } else if (alerta === 10 && configuracao.alerta_10_minutos === true) {
                console.log('notifcação de 10')
                return admin.messaging().sendToDevice(notificationKey ? notificationKey : '', payload)
                    .then(response =>
                        console.log('response de 10 min', JSON.stringify((response)))
                    )
                    .catch(err => console.log('erro de 10 min ', JSON.stringify(err)))

            } else if (alerta === 5 && configuracao.alerta_5_minutos === true) {
                console.log('notificação de 5 min')
                return admin.messaging().sendToDevice(notificationKey ? notificationKey : '', payload)
                    .then(response =>
                        console.log('response de 5 min', JSON.stringify(response))
                    )
                    .catch(err => console.log('erro de 5 min ', JSON.stringify(err)))

            } else if (alerta === 0) {
                return admin.messaging().sendToDevice(notificationKey ? notificationKey : '', payload)
                    .then(response =>
                        console.log('response de 0 min', JSON.stringify(response))
                    )
                    .catch(err => console.log('erro de 0 min ', JSON.stringify(err)))
            }
            return null;
        })
        .catch(e => console.log(e));
}

exports.calculaVagasEstacionadas = functions.database
    .ref('/estacionar/{uf}/{cidade}/{anoEdital}/{userId}/{estacionamentoId}')
    .onWrite((change, context) => {

        const uf = context.params.uf;
        const cidade = context.params.cidade;
        const anoEdital = context.params.anoEdital;

        // Obtem o item (no) atual escrito no firebase
        const original = change.after.val();

        const area_id = original.area_id;
        const setor_id = original.setor_id;

        const childsFromAnoEdital = change.after.ref.parent.parent;

        return childsFromAnoEdital
            .once("value")

            .then(snapshot => {

                const estacionamentoHistoricoObjArr = Utils.snapshotToArr(snapshot);
                const estacionamentoHistoricoArr = Utils.objToArr(estacionamentoHistoricoObjArr);

                const veiculosEstacionadosArr = estacionamentoHistoricoArr
                    .filter(_item => _item.area_id === area_id)
                    .filter(_item => _item.setor_id === setor_id)
                    .filter(_item => _item.status === true);

                const veiculosEstacionadosNormalArr = veiculosEstacionadosArr ?
                    veiculosEstacionadosArr.filter(_item => _item.categoria.toUpperCase() === 'normal'.toUpperCase()) : [];

                const veiculosEstacionadosDeficienteArr = veiculosEstacionadosArr ?
                    veiculosEstacionadosArr.filter(_item => _item.categoria.toUpperCase() === 'deficiente'.toUpperCase()) : [];

                const veiculosEstacionadosIdosoArr = veiculosEstacionadosArr ?
                    veiculosEstacionadosArr.filter(_item => _item.categoria.toUpperCase() === 'idoso'.toUpperCase()) : [];

                const veiculosEstacionadosCargaDescarga = veiculosEstacionadosArr ?
                    veiculosEstacionadosArr.filter(_item => _item.categoria.toUpperCase() === 'carga_descarga'.toUpperCase()) : [];

                const qtdNormalEstacionados = veiculosEstacionadosNormalArr.length;
                const qtdDeficienteEstacionados = veiculosEstacionadosDeficienteArr.length;
                const qtdIdosoEstacionados = veiculosEstacionadosIdosoArr.length;
                const qtdCargaDescargaEstacionados = veiculosEstacionadosCargaDescarga.length;

                const itemUpdate = {
                    qtd_normal_estacionados: qtdNormalEstacionados,
                    qtd_deficiente_estacionados: qtdDeficienteEstacionados,
                    qtd_idoso_estacionados: qtdIdosoEstacionados,
                    qtd_carga_descarga_estacionados: qtdCargaDescargaEstacionados
                };

                return itemUpdate;
            })

            // Atualiza a entidade
            .then(_item => {
                console.log(`/setores/${uf}/${cidade}/${anoEdital}/${area_id}/${setor_id}`, _item);
                return admin.database()
                    .ref(`/setores/${uf}/${cidade}/${anoEdital}/${area_id}/${setor_id}`)
                    .update(_item);
            })

            .catch(e => console.log(e));

    });

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'contatozonafacil@gmail.com',
        pass: 'Z0n@F@cil$3nh@'
    }
})

/**
 * https://us-central1-zonaazulfortaleza-temp.cloudfunctions.net/sendEmail
 * 
 * https://us-central1-zonaazulfortaleza-prod.cloudfunctions.net/sendEmail
 * 
 */
exports.sendEmail = functions.https.onRequest((req, res) => {

    res.set('Access-Control-Allow-Origin', '*') // CrossOrigin Error 

    const data = req.query.data;

    const comprovante = JSON.parse(data);
    const userEmail = comprovante.email;
    const assunto = comprovante.from == 'estacionar' ? "Comprovante de Estacionamento - " : "Comprovante de Pagamento -"

    const emailContent = Utils.makeComprovanteEmail(comprovante)

    console.log('conteudo do email', JSON.stringify(emailContent))

    const emailOptions = {
        from: 'Zona Fácil <contatozonafacil@gmail.com>',
        to: `${userEmail}`,
        subject: `${assunto} Zona Azul`,
        html: `${emailContent}`
    };

    return transporter.sendMail(emailOptions, (err, info) => {
        if (err) {
            console.log('erro que deu ', err.response)
            res.status(200).send('OK')

        }
        res.status(200).send('OK')
    })
})


exports.sendPdv = functions.database
    .ref('/users/{uf}/{cidade}/{anoEdital}/{userId}/{pdvReg}')
    .onCreate((snap, context) => {
        const distribuidorCNPJ = 'CNPJ: 05.591.991/0001-48';
        const distribuidorRazaoSocial = ` NECAVA INSPECAO E PESQUISA EM TRANSPORTES LTDA - ME
        AV GODOFREDO MACIEL, 2841, CEP: 60710-001`;
        const site = 'http://www.zonafacil.com.br/';
        const data = snap.val()
        snap.ref.parent.on('value', (snap) => {
            const field = snap.val()
            let html = ''
            html += `<h1>  Inscricao PDV  </h1>`
            html += `<h2>  Dados do Responsável:  </h2>`
            html += `<p>  Nome : ${field.name}  </p>`
            html += `<p>  Email: ${field.email}  </p>`
            html += `<p>  Telefone:${field.phone} </p>`
            html += `<h2>  Dados da Empresa  </h2>`
            html += `<p>  Cep da Empresa: ${data.cep} </p>`
            html += `<p>  Cnpj: ${data.cnpj} </p>`
            html += `<p>  Email da Empresa: ${data.empEmail} </p>`
            html += `<p>  Telefone da Empresa: ${data.empPhone} </p>`
            html += `<p>  Endereco da Empresa ${data.endereco} </p>`
            html += `<p>  Inscricao Municipal: ${data.insMun} </p>`
            html += `<p>  Modalidade escolhida: ${data.modalidade} </p>`
            html += ` <p>  Razao social: ${data.rSocial} </p>`
            html += `<div style='display:flex;flex-direction: row;'>
                        <div> <img  width="100px" height="100px" src="https://firebasestorage.googleapis.com/v0/b/zonaazulfortaleza-temp.appspot.com/o/logo-bg.png?alt=media&token=3d9ccc6f-0e0f-4b20-8f4f-ed82a2784e39"/> </div>
                        <div style = 'margin: 0 0 25px 5px; width:300px; '> 
                            <p style="margin:5px;">  ${distribuidorRazaoSocial}  </p>
                            <p style="margin:5px;">  ${distribuidorCNPJ}  </p> 
                            <a href="${site}"> ${site} </a>
                        </div>
                    </div>`


            let userHtml = ''
            userHtml += `<div>
                <p> 
                    Estamos enviando esse email confirmando o recebimento dos dados para
                    solicitação para cadastro de PDV. Em breve enviaremos outro email com 
                    a resposta sobre o seu cadastro.

                    Em caso de duvidas entrar em contato conosco pelos seguintes canais:
                </p> 
                <p> 
                    Email: contatozonafacil@gmail.com ou suporte@zonafacil.com.br 
                </p>

                <div style='display:flex;flex-direction: row;'>
                        <div> <img  width="100px" height="100px" src="https://firebasestorage.googleapis.com/v0/b/zonaazulfortaleza-temp.appspot.com/o/logo-bg.png?alt=media&token=3d9ccc6f-0e0f-4b20-8f4f-ed82a2784e39"/> </div>
                        <div style = 'margin: 0 0 25px 5px; width:300px; '> 
                            <p style="margin:5px;">  ${distribuidorRazaoSocial}  </p>
                            <p style="margin:5px;">  ${distribuidorCNPJ}  </p> 
                            <a href="${site}"> ${site} </a>
                        </div>
                </div>
            
            </div>`


            const emailOptions = {
                from: 'Zona Fácil <contatozonafacil@gmail.com>',
                to: 'suporte@zonafacil.com.br',
                subject: `${"Cadastro PDV"} Zona Azul`,
                html: `${html}`,
                attachments: [{ filename: 'doc.jpeg', content: Buffer.from(data.documento.split(",")[1], 'base64') }]
            };

            const UseremailOptions = {
                from: 'Zona Fácil <contatozonafacil@gmail.com>',
                to: `${field.email}`,
                subject: `${"Cadastro PDV"} Zona Azul`,
                html: `${userHtml}`
            }


            transporter.sendMail(emailOptions, (err, info) => {
                if (err) {
                    console.log(error)
                }

                transporter.sendMail(UseremailOptions, (err, info) => {
                    if (err) {
                        console.log(error)
                    }
                })
            })

        })

    })

exports.reportProblem = functions.database
    .ref('/relatos/{uf}/{cidade}/{anoEdital}/{userId}/{relatoId}')
    .onWrite((change, context) => {
        const content = change.after.val()
        // const idRelato = context.params.relatoId
        const user = context.params.userId

        const { subject, message } = content;
        return admin.database().ref(`/users/ce/fortaleza/2018/${user}`)
            .once('value')
            .then(_userInfo => {
                const userDatas = _userInfo.val();
                const { email, name } = userDatas

                const emailOptions = {
                    from: `${name} ${email}`,
                    replyTo: `${email}`,
                    to: `suporte@zonafacil.com.br`,
                    subject: `${subject}`,
                    html: `${message}`
                };

                return transporter.sendMail(emailOptions, (err, info) => {
                    err ? console.log('Não foi possivel encaminhar o e-mail') : console.log('Email encaminhado com sucesso', info)

                });
            }).catch(err => {
                console.log('Algo deu errado', err)
            })

    })