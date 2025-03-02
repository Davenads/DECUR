// This file provides type declarations for the server-side code
// to handle the TypeScript errors when package types cannot be found

declare module 'express' {
  import { Server } from 'http';
  
  interface Request {
    user?: any;
    header(name: string): string | undefined;
    params: { [key: string]: string };
    body: any;
  }
  
  interface Response {
    status(code: number): Response;
    json(data: any): void;
    sendFile(path: string): void;
  }
  
  interface NextFunction {
    (error?: any): void;
  }
  
  interface Express {
    use: any;
    get: any;
    post: any;
    put: any;
    delete: any;
    listen(port: number, callback?: () => void): Server;
  }
  
  interface Router {
    use: any;
    get: any;
    post: any;
    put: any;
    delete: any;
  }
  
  function express(): Express;
  
  namespace express {
    function Router(): Router;
    function static(path: string): any;
    function json(): any;
    function urlencoded(options: { extended: boolean }): any;
  }
  
  export = express;
}

declare module 'mongoose' {
  interface Schema {
    pre<T>(event: string, fn: Function): void;
    methods: any;
  }
  
  interface Document {
    save(): Promise<Document>;
    isModified(path: string): boolean;
  }
  
  interface Model<T extends Document> {
    findOne(query: any): Promise<T | null>;
    findById(id: string): Promise<T | null>;
    find(query?: any): Promise<T[]>;
    findByIdAndUpdate(id: string, update: any, options?: any): Promise<T | null>;
    findByIdAndDelete(id: string): Promise<T | null>;
  }
  
  namespace mongoose {
    function connect(uri: string, options?: any): Promise<typeof mongoose>;
    function model<T extends Document>(name: string, schema: Schema): Model<T>;
    
    class Schema {
      constructor(definition: any, options?: any);
      static Types: {
        ObjectId: any;
        Mixed: any;
      };
      pre<T>(event: string, fn: Function): void;
      methods: any;
    }
    
    type Types = {
      ObjectId: any;
    };
  }
  
  export = mongoose;
}

declare module 'jsonwebtoken' {
  function sign(payload: any, secret: string, options?: any): string;
  function verify(token: string, secret: string): any;
  
  export { sign, verify };
}

declare module 'bcryptjs' {
  function genSalt(rounds: number): Promise<string>;
  function hash(data: string, salt: string): Promise<string>;
  function compare(data: string, encrypted: string): Promise<boolean>;
  
  export { genSalt, hash, compare };
}

declare module 'lodash' {
  function merge<T>(...objects: any[]): T;
  
  export { merge };
}