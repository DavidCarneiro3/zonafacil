import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CieloHelper } from './cielo-helper';

@Injectable()
export class CieloProvider{

	private apiUrl: string;
	private apiQueryUrl: string;
	private hearders;
	private cieloHelper = new CieloHelper;

	constructor(private http: HttpClient){
		
		if(environment.production){
			this.apiUrl = environment.cieloProd.apiUrl;
			this.apiQueryUrl = environment.cieloProd.apiQueryUrl;
			this.hearders = new HttpHeaders({
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'MerchantId': environment.cieloProd.merchantId,
				'MerchantKey': environment.cieloProd.merchantKey
			})
		}else{
			this.apiUrl = environment.cieloDev.apiUrl;
			this.apiQueryUrl = environment.cieloDev.apiQueryUrl;
			this.hearders = new HttpHeaders({
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'MerchantId': environment.cieloDev.merchantId,
				'MerchantKey': environment.cieloDev.merchantKey
			})
		}
	}

	buy(data){
		return this.http.post(this.apiUrl + '/1/sales', data, {headers: this.hearders})
			.toPromise()
	}

	resolver(type: string, data: any, card?: any): any{
		let _card
		let brand = this.cieloHelper.getBrand(card ? card.numero : false)
		data.Payment.Amount = this.cieloHelper.getAmount(data.Payment.Amount) 

		if(brand || !card){
			if(card){
				_card = {
					CardNumber: card.numero,
					Holder: card.nome,
					ExpirationDate: this.cieloHelper.getDateFormat(card.data),
					SecurityCode: card.ccv.toString(),
					Brand: brand
				}	
			}
			
			if(type === 'credit'){
				data.Payment.Type = 'CreditCard'
				return this.credit(data, _card)
			}else if(type === 'debit'){
				data.Payment.Type = 'DebitCard'
				data.Payment.Authenticate = true
				return this.debit(data, _card);
			}else if(type === 'ticket'){
				data.Payment.Type = 'Boleto'
				return this.ticket(data)
			}else{
				return new Promise<any>((resolve, reject) =>{
					return reject('Tipo de operação inválida');
				})
			}
			
		}else{
			return new Promise<any>((resolve, reject) =>{
				reject('Bandeira de cartão não suportada');
			})
		}
	}

	credit(data: any, card: any){
		data.Payment.CreditCard = card;
		return this.buy(data);
	}

	debit(data: any, card: any){
		data.Payment.DebitCard = card;
		data.Payment.ReturnUrl = 'https://google.com';
		return this.buy(data);
	}

	ticket(data: any){
		data.Payment.ExpirationDate = this.cieloHelper.getBoletoExpirationDate();
		return this.buy(data)
	}


}