import { Module } from '@danet/core';
import { KvService } from "./service.ts";

/**
 * Provide access to KvService that handle KV Connection
 */
@Module({
    imports: [],
    injectables: [KvService],
})
export class KvModule {}
