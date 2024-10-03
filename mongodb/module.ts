import { Module } from '@danet/core';
import { MongodbService } from './service.ts';

/**
 * Provide access to MongoDbService which handle Mongo connection
 */
@Module({
    imports: [],
    injectables: [MongodbService],
})
export class MongodbModule {}
