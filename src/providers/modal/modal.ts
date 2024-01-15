import { Injectable } from '@angular/core';

@Injectable()
export class ModalProvider {

	public active: boolean;

	constructor() { this.active = false }

	public setActive() {
		this.active = true;
	}

	public desactivate() {
		this.active = false;
	}

	public isActive(): boolean {
		return this.active;
	}
}