import { Injectable } from '@danet/core';
import type { OnAppBootstrap, OnAppClose } from '@danet/core/hook';

/**
 * KvService is a service class that manages a Deno.Kv client.
 * It implements the OnAppBootstrap and OnAppClose interfaces to handle
 * initialization and cleanup of the Kv client.
 *
 * @implements {OnAppBootstrap}
 * @implements {OnAppClose}
 */

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
