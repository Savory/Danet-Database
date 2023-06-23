import { Module } from 'danet/mod.ts';
import { KvService } from "./service.ts";

@Module({
    imports: [],
    injectables: [KvService],
})
export class KvModule {}
