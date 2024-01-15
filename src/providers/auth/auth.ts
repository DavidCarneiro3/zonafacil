import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';

import { UserProvider } from '../user/user';
import * as firebase from "firebase";
import { User } from "../../models/user";

import 'rxjs/add/operator/take';

@Injectable()
export class AuthProvider {

    user: firebase.User;

    constructor(public afa: AngularFireAuth, public userProvider: UserProvider) { }

    get authenticated(): boolean {
        return this.user != null;
    }

    createUserAuth(email: string, password: string, user): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.afa.auth.createUserWithEmailAndPassword(email, password)
                .then(authState => {
                    user.id = authState.uid;
                    user.status = true;
                    user.profile = 'user';
                    delete user.password;

                    this.userProvider.saveUser(new User(user));
                    resolve(user);

                }).catch(error => reject(error));
        });
    }

    login(email: string, password: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.afa.auth.signInWithEmailAndPassword(email, password)
                .then((user) => {
                    if (user != null && user.uid != null) {
                        this.afa.authState.subscribe(user => this.user = user);
                        this.userProvider.saveUserLocal(user.uid);
                        this.userProvider.byId(user.uid).take(1).subscribe((user: User) => {
                            (user) ? resolve({ logged: user }) : resolve({ logged: false });
                        });
                    }
                })
                .catch(err => reject(err));
        });
    }

    logout() {
        return this.afa.auth.signOut();
    }

    sendPasswordResetEmail(email: string): Promise<any> {
        return this.afa.auth.sendPasswordResetEmail(email);
    }

    getId() {
        return this.user && this.user.uid;
    }

}
