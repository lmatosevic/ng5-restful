import {HttpClient, HttpResponse, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {map, catchError} from 'rxjs/operators';

export abstract class BaseService {
    protected http: HttpClient;

    constructor(http: HttpClient) {
        this.http = http;
    }

    public get<E>(path: string, parameters: any = {}, options: Object = {}): Observable<E> {
        return this.http.get(path, this.generateRequestOptions(parameters, options))
            .pipe(map((response: HttpResponse<E>) => response), catchError(this.handleError));
    }

    public post<E>(path: string, body: any, options: Object = {}): Observable<E> {
        return this.http.post(path, body, options)
            .pipe(map((response: HttpResponse<E>) => response), catchError(this.handleError));
    }

    public put<E>(path: string, body: any, options: Object = {}): Observable<E> {
        return this.http.put(path, body, options)
            .pipe(map((response: HttpResponse<E>) => response), catchError(this.handleError));
    }

    public delete<E>(path: string, options: Object = {}): Observable<E> {
        return this.http.delete(path, options)
            .pipe(map((response: HttpResponse<E>) => response), catchError(this.handleError));
    }

    public generateRequestOptions(parameters: any, options: any = {}): Object {
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
        return throwError(error.message || error);
    }
}
