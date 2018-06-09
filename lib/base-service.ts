import {HttpClient, HttpResponse, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map, catchError} from 'rxjs/operators';

export abstract class BaseService {
    constructor() {
    }

    public get<E>(path: string, parameters: any = {}, options: object = {}): Observable<E> {
        return this.getHttpClient().get(path, this.generateRequestOptions(parameters, options))
            .pipe(map((response: HttpResponse<E>) => response), catchError(this.handleError));
    }

    public post<E>(path: string, body: any, options: object = {}): Observable<E> {
        return this.getHttpClient().post(path, body, options)
            .pipe(map((response: HttpResponse<E>) => response), catchError(this.handleError));
    }

    public put<E>(path: string, body: any, options: object = {}): Observable<E> {
        return this.getHttpClient().put(path, body, options)
            .pipe(map((response: HttpResponse<E>) => response), catchError(this.handleError));
    }

    public delete<E>(path: string, options: object = {}): Observable<E> {
        return this.getHttpClient().delete(path, options)
            .pipe(map((response: HttpResponse<E>) => response), catchError(this.handleError));
    }

    public generateRequestOptions(parameters: any, options: object = {}): object {
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
