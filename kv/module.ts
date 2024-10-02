import { Module } from '@danet/core';
import { KvService } from "./service.ts";

@Module({
    imports: [],
    injectables: [KvService],
})
export class KvModule {}
