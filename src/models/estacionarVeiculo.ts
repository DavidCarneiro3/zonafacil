import { VeiculoModel } from "./veiculo";
import { EstacionarModel } from "./estacionar";

export class EstacionarVeiculoModel {
    veiculo: VeiculoModel;
    estacionar: EstacionarModel;

    constructor()
    constructor(obj: any)
    constructor(obj?: any) {
        this.veiculo = obj && obj.veiculo || new VeiculoModel();
        this.estacionar = obj && obj.estacionar || new EstacionarModel();
    }
}