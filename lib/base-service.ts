import {HttpClient, HttpResponse, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export abstract class BaseService {
    constructor() {
    }

    public get<E>(path: string, parameters: any = {}, options: object = {}): Observable<E> {
        return this.getHttpClient().get(path, this.generateRequestOptions(parameters, options))
            .map((response: HttpResponse<E>) => response)
            .catch(this.handleError);
    }

    public post<E>(path: string, body: any, options: object = {}): Observable<E> {
        return this.getHttpClient().post(path, body, options)
            .map((response: HttpResponse<E>) => response)
            .catch(this.handleError);
    }

    public put<E>(path: string, body: any, options: object = {}): Observable<E> {
        return this.getHttpClient().put(path, body, options)
            .map((response: HttpResponse<E>) => response)
            .catch(this.handleError);
    }

    public delete<E>(path: string, options: object = {}): Observable<E> {
        return this.getHttpClient().delete(path, options)
            .map((response: HttpResponse<E>) => response)
            .catch(this.handleError);
    }

    public generateRequestOptions(parameters: any, options: object = {}): Object {
        if (!parameters) {
            return options;
        }

        let params = new HttpParams();
        Object.keys(parameters).forEach(key => {
            params.set(key, parameters[key]);
        });
        options['params'] = params;
        return options;
    }

    public handleError(error: any): Observable<any> {
        return Observable.throw(error.message || error);
    }

    abstract getHttpClient(): HttpClient;
}
