import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export let isDebugMode = environment.isDebugMode;

const noop = (): any => undefined;

export abstract class Logger {
  info: any;
  warn: any;
  error: any;
}

@Injectable()
export class LoggerProvider implements Logger {

  constructor() {
  }

  get debug() {
    if (isDebugMode) {
      return console.info.bind(console);
    } else {
      return noop;
    }
  }

  get info() {
    if (isDebugMode) {
      return console.info.bind(console);
    } else {
      return noop;
    }
  }

  get warn() {
    if (isDebugMode) {
      return console.warn.bind(console);
    } else {
      return noop;
    }
  }

  get error() {
    if (isDebugMode) {
      return console.error.bind(console);
    } else {
      return noop;
    }
  }

  invokeConsoleMethod(type: string, args?: any): void {
    const logFn: Function = (console)[type] || console.log || noop;
    logFn.apply(console, [args]);
  }

}
