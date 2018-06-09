import {HttpHeaders, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map, catchError} from 'rxjs/operators';

import {Serializable} from './serializable';
import {BaseService} from './base-service';

export abstract class RestService<T extends Serializable, E> extends BaseService {
    private headers: HttpHeaders = new HttpHeaders({'Content-Type': 'application/json'});

    constructor() {
        super();
    }

    public query(parameters: any, path: string = null): Observable<T[]> {
        let finalPath = path != null ? path : this.getBaseUrlPath();
        return this.getHttpClient().get(finalPath, this.generateRequestOptions(parameters, {}))
            .pipe(map((response: HttpResponse<T[]>) => response), catchError(this.handleError));
    }

    public getOne(id: number, path: string = null): Observable<T> {
        let finalPath = path != null ? path : this.getBaseUrlPath();
        const url = finalPath + (id != null ? '/' + id : '');
        return this.getHttpClient().get(url)
            .pipe(map((response: HttpResponse<T>) => response), catchError(this.handleError));
    }

    public createOne(model: T, path: string = null): Observable<E> {
        let finalPath = path != null ? path : this.getBaseUrlPath();
        return this.getHttpClient().post(finalPath, model.serialize(), {headers: this.headers})
            .pipe(map((response: HttpResponse<E>) => response), catchError(this.handleError));
    }

    public updateOne(model: T, path: string = null): Observable<E> {
        let finalPath = path != null ? path : this.getBaseUrlPath();
        return this.getHttpClient().put(finalPath, model.serialize(), {headers: this.headers})
            .pipe(map((response: HttpResponse<E>) => response), catchError(this.handleError));
    }

    public deleteOne(id: number, path: string = null): Observable<E> {
        let finalPath = path != null ? path : this.getBaseUrlPath();
        const url = finalPath + (id != null ? '/' + id : '');
        return this.getHttpClient().delete(url, {headers: this.headers})
            .pipe(map((response: HttpResponse<E>) => response), catchError(this.handleError));
    }

    abstract getBaseUrlPath(): string;
}
