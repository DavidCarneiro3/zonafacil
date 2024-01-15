import { Injectable } from '@angular/core';
import { AngularFireDatabase } from "angularfire2/database";
import { Constants } from "../../environments/constants";

@Injectable()
export class ReportarProblemaProvider{

	constructor(public afd: AngularFireDatabase) {}
	
	getModel(data: any){

		return {
			date: new Date().toISOString(),
			subject: data.subject,
			message: data.message 
		}
	}

	save(userId, entity) {
		entity = this.getModel(entity);
	    return this.afd.list(Constants.PATH_DOCUMENTS_RELATOS + userId).push(entity);
	}
}