// Global type declarations for the project

// Module declarations
declare module 'express' {
  export interface Request {
    user?: any;
    header(name: string): string | undefined;
    params: any;
    body: any;
    method: string;
    url: string;
  }
  
  export interface Response {
    status(code: number): Response;
    json(data: any): void;
    sendFile(path: string): void;
  }
  
  export interface NextFunction {
    (error?: any): void;
  }
  
  export interface Express {
    use(middleware: any): Express;
    get(path: string, handler: any): Express;
    post(path: string, handler: any): Express;
    put(path: string, handler: any): Express;
    delete(path: string, handler: any): Express;
    listen(port: number, callback?: () => void): any;
  }
  
  export interface Router {
    use: any;
    get: any;
    post: any;
    put: any;
    delete: any;
  }
  
  interface ExpressModule {
    (): Express;
    Router(): Router;
    static(path: string): any;
    json(): any;
    urlencoded(options: { extended: boolean }): any;
  }
  
  const express: ExpressModule;
  export default express;
}

declare module 'mongoose' {
  export interface Document {
    _id: any;
    save(): Promise<any>;
    isModified(path: string): boolean;
  }
  
  export interface Model<T> {
    new (data: any): T;
    findOne(query: any): Promise<T | null>;
    findById(id: string): Promise<any>;
    find(query?: any): any;
    findByIdAndUpdate(id: string, update: any, options?: any): Promise<T | null>;
    findByIdAndDelete(id: string): Promise<T | null>;
  }
  
  export class Schema {
    constructor(definition: any, options?: any);
    static Types: any;
    pre(event: string, fn: Function): void;
    methods: any;
  }
  
  export function model<T>(name: string, schema: Schema): Model<T>;
  export function connect(uri: string, options?: any): Promise<any>;
  
  export const Types: {
    ObjectId: any;
    Mixed: any;
  };
}

declare module 'jsonwebtoken' {
  export function sign(payload: any, secret: string, options?: any): string;
  export function verify(token: string, secret: string): any;
}

declare module 'bcryptjs' {
  export function genSalt(rounds: number): Promise<string>;
  export function hash(data: string, salt: string): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
}

declare module 'lodash' {
  export function merge<T>(...objects: any[]): T;
}

// Declare config object so TypeScript doesn't show errors
declare interface Config {
  server: {
    port: number;
    host: string;
  };
  database: {
    uri: string;
  };
  auth: {
    jwtSecret: string;
    jwtExpiration: string;
  };
  logging: {
    level: string;
  };
}

declare module '../config' {
  const config: Config;
  export default config;
}

declare module '../../config' {
  const config: Config;
  export default config;
}