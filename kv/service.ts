import { Injectable } from '@danet/core';
import type { OnAppBootstrap, OnAppClose } from '@danet/core/hook';

@Injectable()
export class KvService implements OnAppBootstrap, OnAppClose {
  constructor() {}

  public kvClient!: Deno.Kv;

  async onAppBootstrap() {
    this.kvClient = await Deno.openKv();
  }

  client(): Deno.Kv {
    return this.kvClient;
  }

  async onAppClose() {
    await this.kvClient.close();
  }
}
