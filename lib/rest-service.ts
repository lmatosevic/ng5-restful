import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map, catchError} from 'rxjs/operators';

import {Serializable} from './serializable';
import {BaseService} from './base-service';

export abstract class RestService<T extends Serializable, E extends Serializable> extends BaseService {
    protected http: HttpClient;
    private headers: HttpHeaders = new HttpHeaders({'Content-Type': 'application/json'});

    constructor(http: HttpClient) {
        super(http);
        this.http = http;
    }

    public query(options: Object = {}, path: string = null): Observable<T[]> {
        let finalPath = path != null ? path : this.getBaseUrlPath();
        return this.http.get(finalPath, options)
            .pipe(map((response: HttpResponse<T[]>) => response), catchError(this.handleError));
    }

    public getAll(path: string = null): Observable<T[]> {
        return this.query({}, path);
    }

    public getOne(id: number, options: Object = {}, path: string = null): Observable<T> {
        let finalPath = path != null ? path : this.getBaseUrlPath();
        const url = finalPath + (id != null ? '/' + id : '');
        return this.http.get(url, options)
            .pipe(map((response: HttpResponse<T>) => response), catchError(this.handleError));
    }

    public createOne(model: T, options: Object = {headers: this.headers}, path: string = null): Observable<E> {
        let finalPath = path != null ? path : this.getBaseUrlPath();
        return this.http.post(finalPath, model.serialize(), options)
            .pipe(map((response: HttpResponse<E>) => response), catchError(this.handleError));
    }

    public updateOne(model: T, options: Object = {headers: this.headers}, path: string = null): Observable<E> {
        let finalPath = path != null ? path : this.getBaseUrlPath();
        return this.http.put(finalPath, model.serialize(), options)
            .pipe(map((response: HttpResponse<E>) => response), catchError(this.handleError));
    }

    public deleteOne(id: number, options: Object = {headers: this.headers}, path: string = null): Observable<E> {
        let finalPath = path != null ? path : this.getBaseUrlPath();
        const url = finalPath + (id != null ? '/' + id : '');
        return this.http.delete(url, options)
            .pipe(map((response: HttpResponse<E>) => response), catchError(this.handleError));
    }

    abstract getBaseUrlPath(): string;
}
