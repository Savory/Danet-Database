import { Module } from 'danet/mod.ts';
import { MongodbService } from './service.ts';

@Module({
    imports: [],
    injectables: [MongodbService],
})
export class MongodbModule {}
