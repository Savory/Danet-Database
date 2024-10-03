import { Injectable } from '@danet/core';
import type { OnAppBootstrap, OnAppClose } from '@danet/core/hook';
import { type Collection, type Database, type Document, MongoClient } from '@db/mongo';

@Injectable()
/**
 * Connect to a mongoDB database using the `mongo` driver.
 * It implements the `OnAppBootstrap` and `OnAppClose` interfaces to manage
 * the lifecycle of the database connection.
 */
export class MongodbService implements OnAppBootstrap, OnAppClose {
  constructor() {}

  private client = new MongoClient();
  private db!: Database;
  getCollection<T extends Document>(collectionName: string): Collection<T> {
    return this.db.collection<T>(collectionName);
  }

  async onAppBootstrap() {
    let connectionString = `mongodb://${Deno.env.get('DB_USERNAME')}:${
      Deno.env.get('DB_PASSWORD')
    }@${Deno.env.get('DB_HOST')}/${
      Deno.env.get('DB_NAME')
    }?authMechanism=SCRAM-SHA-1`;
    if (!Deno.env.get('DB_USERNAME')) {
      connectionString = `mongodb://${Deno.env.get('DB_HOST')}/${
        Deno.env.get('DB_NAME')
      }?authMechanism=SCRAM-SHA-1`;
    }
    this.db = await this.client.connect(connectionString);
  }

  async onAppClose() {
    await this.client.close();
  }
}
