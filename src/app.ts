import express, { Application } from 'express';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import ErrorMiddleware from '@/middleware/error.middleware';
import Controller from '@/utils/interfaces/controller.interface';
import databaseManager from '@/middleware/database.middleware';

class App {
    public express: Application;
    public port: number;

    constructor(controllers: Controller[], port: number) {
        this.express = express();
        this.port = port;

        this.initMiddleware();
        this.initControllers(controllers);
        this.initDbConnection();
        this.initErrorHandling();
    }

    private initMiddleware(): void {
        this.express.use(helmet());
        this.express.use(cors());
        this.express.use(morgan('dev'));
        this.express.use(express.json());
        this.express.use(express.urlencoded({ extended: false }));
        this.express.use(compression());
    }

    private initControllers(controllers: Controller[]): void {
        controllers.forEach((controller: Controller) => {
            this.express.use('/api.drugreference.com/v1', controller.router);
        })
    }

    private initDbConnection(): void {
        const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_PATH } = process.env;
        databaseManager(MONGODB_USER, MONGODB_PASSWORD, MONGODB_PATH);
    }

    private initErrorHandling(): void {
        this.express.use(ErrorMiddleware);
    }

    public listen(): void {
        this.express.listen(this.port, () => {
            console.log(`App listening on port ${this.port}`);
        })
    }
}

export default App;