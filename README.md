# ng5-restful
> Angular 5+ library for connecting with RESTful API.

This package is refactored [ng2-restful](https://github.com/Lujo5/ng2-restful) in a way to use and support newest Angular 5+ features.

## Instalation
Install library into your project using Node package manager (NPM).

```sh
npm install ng5-restful --save
```

## Usage
This library **does not** contains an Angular5 module with exported components and service, but instead, provides two classes and one interface:
* **RestService\<T extends Serializable\<T>>** - an abstract class which your services need to extend in order to use provided REST methods
* **GenericResponse** - model class that can be returned from custom GET and POST requests performed from RestService (can be replaced with custom model)
* **Serializable\<T>** - interface which your model classes need to implement in order to be automatically serialized when sent from REST API

Using this RESTful pattern classes allows you to follow best practices for transferring and mapping entity objects from server to your client application. 
And also, provides a level of consistency to your Angular2 application.

### Creating model
Model classes, which represents resource from your REST API need to implement _Serializable_ interface and it's method:
* **serialize(): string** - transforms current state of model object to JSON object
Deserialization will be handled by Angular5 HTTP request library.

Exmaple typescript model class (models/article.model.ts):
``` javascript
import {Serializable} from 'ng5-restful';
import {ArticleType} from './article-type.model';

export class Article implements Serializable {
    id: number;
    name: string;
    content: string;
    articleType: ArticleType;
    createdBy: string;
    created: Date;
    updated: Date;

    serialize(): string {
        return JSON.stringify(this, (key, value) => {
            return value;
        });
    }
}
```

### Implementing service
When model class is implemented, then REST service for that particular resource (model) can be created. 
Create new class as service with Angular2 annotation @Injectable() which extends RestService, then create constructor 
and implement abstract method getBaseUrlPath(): string.

Example typescript service class (services/article.service.ts):
``` javascript
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {RestService} from 'ng5-restful';
import {GenericResponse} from 'ng5-restful';
import {Article} from '../models/article.model';

@Injectable()
export class ArticleService extends RestService<Article, GenericResponse> {

    constructor(private http: HttpClient) {
        super(http);
    }
    
    // This is relative url path on the same host as the angular2 application is served.
    // You can also use full URL path like: http://my.api.com:8080/articles , just make sure
    // that Cross-Origin requests are allowed on that API server.
    getBaseUrlPath(): string {
        return 'api/articles'; 
    }

    // Here you can override handleError method to perform specific actions when error is catched during HTTP request
    // duration. You could also forward error here and handle it when using this service in other components.
    public handleError(error: any): Observable<any> {
        return Observable.throw(error.message || error);
    }
    
    // Optionally, you can perform non-RESTful request using get() or post() methods
    // Returned value is promise of GenericResponse object which is described below.
    public nonRESTfulRequest(articleId: number): Observable<GenericResponse> {
         return this.get<GenericResponse>({id: articleId}, this.getBaseUrlPath() + '/check/article');
    }
}
```

When performing updateOne(), deleteOne(), createOn() or non-RESTful requests using get(), post(), put(), delete() methods
from RestService, then returned value should be provided as Generic type when calling methods, example class could be
GenericResponse which is packed also in this library. GenericResponse contains three fields:
* **success** - _true_ if request was successful, _false_ otherwise
* **description** - Optional description of requested result
* **data** - map with custom values in format: _key -> value_

It's structure is following:
``` javascript
import {Serializable} from './serializable';

export class GenericResponse implements Serializable {
    success: boolean;
    description: string;
    data: Map<string, string> = new Map();

    serialize(): string {
        return JSON.stringify(this);
    }
}
```

### Interacting with API
To use your newly created and implemented service, just inject service into the angular2 @Component's constructor 
and use it as follows:
``` javascript
import {Component, OnInit} from "@angular/core";

import {ArticleService} from "../services/article.service";
import {Article} from "../models/article.model";

@Component({
    moduleId: module.id,
    selector: 'article',
    templateUrl: 'article.component.html'
})
export class ArticleComponent implements OnInit {
    private articles: Article[] = [];
    private article: Article;
    private newArticle: Article = new Article();

    constructor(private articleService: ArticleService) {
    }
    
    ngOnInit(): void {
        // Get all articles with empty parameters list
        this.articleService.query({}).subscribe((articles: Article[]) => {
            this.articles = articles;
        });
        
        // Query articles with URL parameters
        this.articleService.query({typeId: 3, page: 1, limit: 10}).subscribe((articles: Article[]) => {
            this.articles = articles;
        });
        
        // Get one article with provided id
        this.articleService.getOne(5).subscribe((article: Article) => {
            this.article = article;
        });
        
        // Create new article with provided article model object
        this.articleService.createOne(this.newArticle).subscribe((response: GenericResponse) => {
            if (repsonse.success) {
                console.log("Article created! Description: " + response.description);
                console.log("New article id is: " + response.data.get('id');
            } else {
                console.log("Failed creating article");
            }
        });
        
        // Update one article with provided article model object which must have id
        this.articleService.updateOne(this.article).subscribe((response: GenericResponse) => {
            if (repsonse.success) {
                console.log("Article updated! Description: " + response.description);
            } else {
                console.log("Failed updating article");
            }
        });
        
        // Delete one article with provided id
        this.articleService.deleteOne(this.article.id).subscribe((response: GenericResponse) => {
            if (repsonse.success) {
                console.log("Article deleted! Description: " + response.description);
            } else {
                console.log("Failed deleting article");
            }
        });
        
        // Custom service request
        this.articleService.nonRESTfulRequest(this.article.id).subscribe((response: GenericResponse) => {
            if (repsonse.success) {
                console.log("Request successful! Description: " + response.description);
                console.log("Returned someValue: " + response.data.get('someValue')):
            } else {
                console.log("Request failed");
            }
        });
    }
}
```

Complete overview of all available methods provided by RestService:

| Service method  | Arguments                                       | HTTP method  | Return type   |
|:----------------|:------------------------------------------------|:-------------|:--------------|
| get             | path: string, parameters: any, *options: object | GET          | Promise\<E>   |
| post            | path: string, body: any, *options: object       | POST         | Promise\<E>   |
| put             | path: string, body: any, *options: object       | PUT          | Promise\<E>   |
| delete          | path: string, *options: object                  | DELETE       | Promise\<E>   |
| query           | parameters: any, *path: string                  | GET          | Promise\<T[]> |
| getOne          | id: number, *path: string                       | GET          | Promise\<T>   |
| createOne       | model: T, *path: string                         | POST         | Promise\<E>   |
| updateOne       | model: T, *path: string                         | PUT          | Promise\<E>   |
| deleteOne       | id: number, *path: string                       | DELETE       | Promise\<E>   |

_Parameters marked with * are optional._

_Generic type \<E> could be custom model class or you can use GenericResponse type already provided in this library_

License
- 
MIT