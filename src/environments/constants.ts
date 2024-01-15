import { environment } from './environment';
export class Constants {

    public static VERSAO_LB = "Versão: ";
    public static VERSAO = Constants.VERSAO_LB + environment.version + (environment.production ? '' : ' - TESTE');


    public static PATH_DOCUMENTS_DEFAULT = "/ce/fortaleza/2018/";

    //Constants used to display pages
    public static HOME_PAGE = { id: 'home', name: 'HomePage' };
    public static PRINCIPAL_PAGE = { id: 'principal', name: 'PrincipalPage' };
    public static ESTACIONADOS_MODAL_PAGE = { id: 'estacionados-modal', name: 'EstacionadosModalPage' };
    public static LOGIN_PAGE = { id: 'login', name: 'LoginPage' };
    public static PAGAMENTOS_PAGE = { id: 'pagamentos', name: 'PagamentosPage' };
    public static PAGAMENTOS_FORM_PAGE = { id: 'pagamentos_form', name: 'PagamentosFormPage' };
    public static VEICULOS_PAGE = { id: 'veiculos', name: 'VeiculosPage' };
    public static VEICULOS_FORM_PAGE = { id: 'veiculos_form', name: 'VeiculosFormPage' };
    public static PROFILE_PAGE = { id: 'profile', name: 'ProfilePage' };
    public static PROFILE_EDIT_PAGE = { id: 'edit', name: 'ProfileEditPage' };
    public static RECOVERY_PASSWORD_PAGE = { id: 'recovery-page', name: 'RecoveryPasswordPage' };
    public static SIGNUP_PAGE = { id: 'signup', name: 'SignupPage' };
    public static ESTACIONAR_PAGE = { id: 'estacionar', name: 'EstacionarPage' };
    public static COMPROVANTE_PAGE = { id: 'comprovante', name: 'ComprovantePage' };
    public static TEMPO_RESTANTE_PAGE = { id: 'tempo-restante', name: 'TempoRestantePage' };
    public static STREAT_VIEW_PAGE = { id: 'streat-view', name: 'StreatViewPage' };
    public static CREDITOS_PAGE = { id: 'creditos', name: 'ComprarCreditosPage' };
    public static HISTORICO_PAGE = { id: 'historico', name: 'HistoricoPage' };
    public static CONFIGURACOES_PAGE = { id: 'configuracoes', name: 'ConfiguracoesPage' };
    public static AJUDA_PAGE = { id: 'ajuda', name: 'AjudaPage' };
    public static COMPARTILHAR_PAGE = { id: 'compartilhar', name: 'CompartilharPage' };
    public static REPORTAR_PROBLEMA_PAGE = { id: 'reportar-problema', name: 'ReportarProblemaPage' };
    public static PDV_CADASTRO_PAGE = { id: 'pdv-cadastro', name: 'PdvCadastroPage' }
    public static PDV_EMPRESA_PAGE = { id: 'pdv-empresa', name: 'PdvEmpresaPage' }
    public static CREDITOS_PAGAMENTO_PAGE = { id: 'creditos-pagamento', name: 'ComprarCreditosPagamentoPage' }
    public static ROOT_PAGE = { id: 'root', name: 'RootPage' };
    public static TERMS_PAGE = { id: 'terms', name: 'TermsPage' };
    public static AREAS_MODAL_PAGE = { id: 'areas-modal', name: 'AreasModalPage' };
    public static SETORES_MODAL_PAGE = { id: 'setores-modal', name: 'SetoresModalPage' };
    public static VEICULOS_MODAL_PAGE = { id: 'veiculos-modal', name: 'VeiculosModalPage' };
    public static VEICULO_ESTACIONADO_PAGE = { id: 'veiculo-estacionado', name: 'VeiculoEstacionadoPage' };
    public static CANCELAR_TRANSACAO_PAGE = { id: 'cancelar-transacao', name: 'CancelarTransacaoPage' };
    public static PERMISSIONS_MODAL_PAGE = { id: 'permissions-screen', name: 'PermissionsModalPage' };
    public static FILTER_MODAL_PAGE = { id: 'filtro-modal', name: 'FiltroModalPage' }
    public static FILTER_PAGAMENTO_PAGE = {id:'filtro-pagamento',name:'FiltroPagamentoPage'}
    public static CONFIRMA_CPF_PAGE = {id:'confirmar-cpf-modal',name:'ConfirmarCpfModalPage'}


    // PROVIDERS
    public static PATH_DOCUMENTS_USER = '/users' + Constants.PATH_DOCUMENTS_DEFAULT;
    public static PATH_DOCUMENTS_PAGAMENTOS = '/pagamentos' + Constants.PATH_DOCUMENTS_DEFAULT;
    public static PATH_DOCUMENTS_VEICULOS = '/veiculos' + Constants.PATH_DOCUMENTS_DEFAULT;
    public static PATH_DOCUMENTS_LOGS = '/logs' + Constants.PATH_DOCUMENTS_DEFAULT;
    public static PATH_DOCUMENTS_SETORES = '/setores' + Constants.PATH_DOCUMENTS_DEFAULT;
    public static PATH_DOCUMENTS_AREAS = '/areas' + Constants.PATH_DOCUMENTS_DEFAULT;
    public static PATH_DOCUMENTS_ESTACIONAR = '/estacionar' + Constants.PATH_DOCUMENTS_DEFAULT;
    public static PATH_DOCUMENTS_CREDITOS = '/creditos' + Constants.PATH_DOCUMENTS_DEFAULT;
    public static PATH_DOCUMENTS_CADS = '/cads' + Constants.PATH_DOCUMENTS_DEFAULT;
    public static PATH_DOCUMENTS_CADS_USER = '/cads_user' + Constants.PATH_DOCUMENTS_DEFAULT;
    public static PATH_DOCUMENTS_TERMS = '/info' + Constants.PATH_DOCUMENTS_DEFAULT;
    public static PATH_DOCUMENTS_CONFIG = '/config' + Constants.PATH_DOCUMENTS_DEFAULT;
    public static PATH_DOCUMENTS_RELATOS = '/relatos' + Constants.PATH_DOCUMENTS_DEFAULT;
    public static PATH_DOCUMENTS_TIPO_VEICULO = Constants.PATH_DOCUMENTS_CONFIG + 'tipo_veiculo';
    public static PATH_DOCUMENTS_HOLIDAYS = '/holidays' + Constants.PATH_DOCUMENTS_DEFAULT;
    public static PATH_DOCUMENTS_CANCELAR = 'cancelar' + Constants.PATH_DOCUMENTS_DEFAULT;
    public static PATH_DOCUMENTS_ANGENDAMENTOS = 'agendamentos' + Constants.PATH_DOCUMENTS_DEFAULT;

    //COLORS POLYLINE SETOR
    public static SETOR_COLOR_RED = '#FF0000';
    public static SETOR_COLOR_GREEN = '#00C160';

    //TYPES USER CONFIGURATIONS
    public static ATIVATION_EXPIRATION = 'ATIVACAO_EXPIRACAO';
    public static ALERT_FIVE_MINUTES = 'ALERTA_5_MINUTOS';
    public static ALERT_TEN_MINUTES = 'ALERTA_10_MINUTOS';
    public static ALERT_FIVETEEN_MINUTES = 'ALERTA_15_MINUTOS';

    public static CieloSandboxCodes = {
        "4": "Operação realizada com sucesso",
        "6": "Operação realizada com sucesso",
        "05": "Não Autorizada",
        "57": "Cartão Expirado",
        "78": "Cartão Bloqueado",
        "99": "Time Out",
        "77": "Cartão Cancelado",
        "70": "Problemas com o Cartão de Crédito"
    }

    public static CieloProductionCodes = {
        // return code -> return message
        "00": "Transação autorizada com sucesso.",
        "000": "Transação autorizada com sucesso.",
        "01": "Transação não autorizada. Entre em contato com seu banco emissor.",
        "02": "Transação não autorizada. Entre em contato com seu banco emissor.",
        "03": "Não foi possível processar a transação. Entre com contato com a Loja Virtual.",
        "04": "Transação não autorizada. Entre em contato com seu banco emissor.",
        "05": "Transação não autorizada. Entre em contato com seu banco emissor.",
        "06": "Não foi possível processar a transação. Entre em contato com seu banco emissor.",
        "07": "Transação não autorizada. Entre em contato com seu banco emissor",
        "08": "Transação não autorizada. Dados incorretos. Reveja os dados e informe novamente.",
        "09": "Transação cancelada parcialmente com sucesso",
        "11": "Transação autorizada com sucesso.",
        "12": "Não foi possível processar a transação. reveja os dados informados e tente novamente. Se o erro persistir, entre em contato com seu banco emissor.",
        "13": "Transação não autorizada. Valor inválido. Refazer a transação confirmando os dados informados. Persistindo o erro, entrar em contato com a loja virtual.",
        "14": "Não foi possível processar a transação. reveja os dados informados e tente novamente. Se o erro persistir, entre em contato com seu banco emissor.",
        "15": "Não foi possível processar a transação. Entre em contato com seu banco emissor.",
        "19": "Não foi possível processar a transação. Refaça a transação ou tente novamente mais tarde. Se o erro persistir entre em contato com a loja virtual.",
        "21": "Não foi possível processar o cancelamento. Tente novamente mais tarde. Persistindo o erro, entrar em contato com a loja virtual.",
        "22": "Não foi possível processar a transação. Valor inválido. Refazer a transação confirmando os dados informados. Persistindo o erro, entrar em contato com a loja virtual.",
        "23": "Não foi possível processar a transação. Valor da prestação inválido. Refazer a transação confirmando os dados informados. Persistindo o erro, entrar em contato com a loja virtual.",
        "24": "Não foi possível processar a transação. Quantidade de parcelas inválido. Refazer a transação confirmando os dados informados. Persistindo o erro, entrar em contato com a loja virtual.",
        "25": "Não foi possível processar a transação. reveja os dados informados e tente novamente. Persistindo o erro, entrar em contato com a loja virtual.",
        "28": "Não foi possível processar a transação. Entre com contato com a Loja Virtual.",
        "30": "Não foi possível processar a transação. Reveja os dados e tente novamente. Se o erro persistir, entre em contato com a loja"

    }

    public static FIREBASE_ERRORS = {
        'auth/email-already-in-use': 'Email já cadastrado',
        'auth/weak-password': 'Senha deve ter no mínimo 6 caracteres',
        'auth/wrong-password': 'E-mail e/ou senha inválido',
        'auth/user-not-found': 'E-mail não cadastrado',
        'auth/requires-recent-login': 'Esta operação querer um login recente! Faça o login e tente novamente.',
        'auth/invalid-email': 'E-mail inválido!',
        '': 'Algo deu Errado!Verifique a conexação e tente novamente!'
    };

}