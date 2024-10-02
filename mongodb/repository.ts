import type { Repository } from '../repository.ts';
import { type Filter, ObjectId, type Document, type Collection } from '@db/mongo';
import type { MongodbService } from './service.ts';


export abstract class MongodbRepository<T extends Document & { _id: string | ObjectId}>
  implements Repository<T> {
  constructor(
    protected dbService: MongodbService,
    public readonly collectionName: string,
  ) {
  }
  async getAll(filter: Filter<T> = {}): Promise<T[]> {
    return (await this.dbService.getCollection<T>(this.collectionName).find(
      filter,
    )
      .toArray()).map((obj) => ({ ...obj, _id: obj._id.toString() }));
  }

  async getOne(filter: Filter<T>): Promise<T | undefined> {
    const obj = await this.dbService.getCollection<T>(this.collectionName)
      .findOne(filter);
    if (!obj) return undefined;
    return {
      ...obj,
      _id: obj._id.toString(),
    };
  }

  async getById(id: string): Promise<T | undefined> {
    const obj = await this.dbService.getCollection<T>(this.collectionName)
      .findOne({        
        // deno-lint-ignore no-explicit-any
        _id: new ObjectId(id),
      } as any);
    if (!obj) return undefined;
    return {
      ...obj,
      _id: obj._id.toString(),
    };
  }

  async create(obj: T): Promise<T> {
    obj._id = new ObjectId();
    await this.dbService.getCollection<T>(
      this.collectionName,
    ).insertOne(obj);
    return obj;
  }

  async updateOne(objId: string, obj: Partial<T>): Promise<ReturnType<Collection<T>["updateOne"]>> {
    const _id = new ObjectId(objId);
    const updated = await this.dbService.getCollection<T>(this.collectionName)
      .updateOne(
        // deno-lint-ignore no-explicit-any
        { _id } as any,
        // deno-lint-ignore no-explicit-any
        { $set: { ...obj } } as any,
      );
    return updated;
  }

  deleteOne(objId: string): Promise<number> {
    return this.dbService.getCollection<T>(this.collectionName).deleteOne({
      _id: new ObjectId(objId)
        // deno-lint-ignore no-explicit-any
    } as any);
  }

  deleteAll(): Promise<number> {
    return this.dbService.getCollection<T>(this.collectionName).deleteMany({});
  }
}
