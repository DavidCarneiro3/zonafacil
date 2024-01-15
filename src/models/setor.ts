import {FaceModel} from "./face";
import {HorarioModel} from "./horario";

export class SetorModel {
    
    nome: string;
    codigo: string;
    faces: FaceModel[];
    latInicio: number;
    lngInicio: number;
    latFim: number;
    lngFim: number;
    cad_veiculo: number;
    cad_caminhao: number;
    horario: HorarioModel[];
    total_vagas: number;
    vagas_deficiente: number;
    vagas_idoso: number;
    vagas_carga_descarga: number;
    qtd_normal_estacionados: number;
    qtd_deficiente_estacionados: number;
    qtd_idoso_estacionados: number;
    qtd_carga_descarga_estacionados: number;

    constructor()
    constructor(obj: any)
    constructor(obj?: any) {
        if (obj && obj.codigo) {
            this.codigo = obj && obj.codigo || '';
        } else {
            this.codigo = obj && obj.$key || '';
        }

        this.codigo = obj && obj.codigo || '';
        this.faces = obj && obj.faces || [];
        this.latInicio = obj && obj.latInicio || 0;
        this.lngInicio = obj && obj.lngInicio || 0;
        this.latFim = obj && obj.latFim || 0;
        this.lngFim = obj && obj.lngFim || 0;
        this.cad_veiculo = obj && obj.cad_veiculo || [];
        this.cad_caminhao = obj && obj.cad_caminhao || [];
        this.horario = obj && obj.horario || [];
        this.total_vagas = obj && obj.total_vagas || 0;
        this.vagas_deficiente = obj && obj.vagas_deficientes || 0;
        this.vagas_idoso = obj && obj.vagas_idoso || 0;
        this.vagas_carga_descarga = obj && obj.vagas_carga_descarga || 0;
        this.qtd_normal_estacionados = obj && obj.qtd_normal_estacionados || 0;
        this.qtd_deficiente_estacionados = obj && obj.qtd_deficiente_estacionados || 0;
        this.qtd_idoso_estacionados = obj && obj.qtd_idoso_estacionados || 0;
        this.qtd_carga_descarga_estacionados = obj && obj.qtd_carga_descarga_estacionados || 0;

        }

        getCoordenada6Digitos(coordenada: number){
            return coordenada.toFixed(6);
        }
}