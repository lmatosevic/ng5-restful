# ng5-restful
> Angular 5+ library for connecting with RESTful API.

> **`ng5-restful` is deprecated**. Please switch to the [ngx-restful](https://github.com/lmatosevic/ngx-restful)

This package is refactored [ng2-restful](https://github.com/lmatosevic/ng2-restful) in a way to use and support newest Angular 5+ features.

Minimum required versions of dependencies:
* `@angular/core`: `>=5.2.11`
* `@angular/common`: `>=5.2.11`
* `rxjs`: `>=5.5.11`

## Instalation
Install library into your project using Node package manager (NPM).

```sh
npm install ng5-restful --save
```

## Usage
This library **does not** contains an Angular5 module with exported components and service, but instead, provides two classes and one interface:
* **RestService\<T, E>** - an abstract class which your services need to extend in order to use provided REST methods
* **GenericResponse** - model class that can be returned from custom GET and POST requests performed from RestService (can be replaced with custom model)
* **Serializable** - interface which your model classes need to implement in order to be automatically serialized when sent from REST API

Using this RESTful pattern classes allows you to follow best practices for transferring and mapping entity objects from server to your client application. 
And also, provides a level of consistency to your Angular2 application.

### Creating model
Model classes, which represents resource from your REST API need to implement _Serializable_ interface and it's method:
* **serialize(): string** - transforms current state of model object to JSON object (DEPRECATED since v3.2.0)

Deserialization will be handled by Angular5 `HttpClient` request library.

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

    // Can be empty function since it is deprecated from version 3.2.0
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
and implement abstract methods getBaseUrlPath(): string and getHttpClient(): HttpClient.

Example typescript service class (services/article.service.ts):
``` javascript
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';

import {RestService, GenericResponse} from 'ng5-restful';
import {Article} from '../models/article.model';

@Injectable()
export class ArticleService extends RestService<Article, GenericResponse> {

    // Injected HttpClient must be protected visibility
    constructor(protected http: HttpClient) {
        super(http);
    }

    // Override this method.
    // This is relative url path on the same host as the angular2 application is served.
    // You can also use full URL path like: http://my.api.com:8080/articles , just make sure
    // that Cross-Origin requests are allowed on that API server.
    getBaseUrlPath(): string {
        return 'api/articles'; 
    }

    // Here you can override handleError method to perform specific actions when error is catched during HTTP request
    // duration. You could also forward error here and handle it when using this service in other components.
    public handleError(error: any): Observable<any> {
        return throwError(error.message || error);
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

    // Deprecated since v3.2.0
    serialize(): string {
        return JSON.stringify(this);
    }
}
```

### Interacting with API
To use your newly created and implemented service, just inject service into the angular2 @Component's constructor 
and use it as follows:
``` javascript
import {Component, OnInit} from '@angular/core';
import {GenericResponse} from 'ng5-restful';

import {ArticleService} from '../services/article.service';
import {Article} from '../models/article.model';

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
        // Get all articles
        this.articleService.getAll().subscribe((articles: Article[]) => {
            this.articles = articles;
        });
        
        // Query articles with URL parameters
        this.articleService.query({params: {typeId: 3, page: 1, limit: 10}}).subscribe((articles: Article[]) => {
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

| Service method  | Arguments                                        | HTTP method | URL  | Return type      |
|:----------------|:-------------------------------------------------|:------------|:-----|:-----------------|
| get             | path: string, *options: object                   | GET         | path | Observable\<E>   |
| post            | path: string, body: any, *options: object        | POST        | path | Observable\<E>   |
| put             | path: string, body: any, *options: object        | PUT         | path | Observable\<E>   |
| delete          | path: string, *options: object                   | DELETE      | path | Observable\<E>   |
| query           | *options: object, *path: string                  | GET         | /    | Observable\<T[]> |
| getAll          | *path: string                                    | GET         | /    | Observable\<T[]> |
| getOne          | id: number, *options: object, *path: string      | GET         | /id  | Observable\<T>   |
| createOne       | model: T, *options: object, *path: string        | POST        | /    | Observable\<E>   |
| updateOne       | model: T, *options: object, *path: string        | PUT         | /id  | Observable\<E>   |
| deleteOne       | id: number, *options: object, *path: string      | DELETE      | /id  | Observable\<E>   |

_Parameters marked with * are optional._

_Generic type \<E> could be custom model class or you can use GenericResponse type already provided in this library_

License
- 
MIT
