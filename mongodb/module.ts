import { Module } from '@danet/core';
import { MongodbService } from './service.ts';

@Module({
    imports: [],
    injectables: [MongodbService],
})
export class MongodbModule {}
