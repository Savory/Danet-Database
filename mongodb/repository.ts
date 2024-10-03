import type { Repository } from '../repository.ts';
import { type Filter, ObjectId, type Document, type Collection } from '@db/mongo';
import type { MongodbService } from './service.ts';


/**
 * Abstract MongoDB repository.
 * Provides basic CRUD operations for a given collection.
 * 
 * @template T - The type of the document, extending Document and containing an _id field.
 * 
 * @implements {Repository<T>}
 */
export abstract class MongodbRepository<T extends Document & { _id: string | ObjectId}>
  implements Repository<T> {
  constructor(
    protected dbService: MongodbService,
    public readonly collectionName: string,
  ) {
  }

  /**
   * Retrieves all documents from the collection that match the specified filter.
   *
   * @param filter - An optional filter object to limit the documents returned.
   * @returns A promise that resolves to an array of documents, with each document's `_id` field converted to a string.
   */
  async getAll(filter: Filter<T> = {}): Promise<T[]> {
    return (await this.dbService.getCollection<T>(this.collectionName).find(
      filter,
    )
      .toArray()).map((obj) => ({ ...obj, _id: obj._id.toString() }));
  }

  /**
   * Retrieves a single document from the collection that matches the specified filter.
   *
   * @template T - The type of the document.
   * @param {Filter<T>} filter - The filter criteria to find the document.
   * @returns {Promise<T | undefined>} A promise that resolves to the found document with the `_id` field converted to a string, or `undefined` if no document matches the filter.
   */
  async getOne(filter: Filter<T>): Promise<T | undefined> {
    const obj = await this.dbService.getCollection<T>(this.collectionName)
      .findOne(filter);
    if (!obj) return undefined;
    return {
      ...obj,
      _id: obj._id.toString(),
    };
  }

  /**
   * Retrieves an object by its ID from the specified collection.
   *
   * @param id - The ID of the object to retrieve.
   * @returns A promise that resolves to the object if found, or `undefined` if not found.
   */
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

  /**
   * Creates a new document in the specified collection.
   * 
   * @param obj - The object to be inserted into the collection. A new `_id` will be generated for this object.
   * @returns A promise that resolves to the inserted object.
   */
  async create(obj: T): Promise<T> {
    obj._id = new ObjectId();
    await this.dbService.getCollection<T>(
      this.collectionName,
    ).insertOne(obj);
    return obj;
  }

  /**
   * Updates a single document in the collection with the specified object ID.
   * 
   * @param objId - The ID of the object to update.
   * @param obj - A partial object containing the fields to update.
   * @returns A promise that resolves to the result of the update operation.
   */
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

  /**
   * Deletes a single document from the collection based on the provided object ID.
   *
   * @param objId - The ID of the document to be deleted.
   * @returns A promise that resolves to the number of documents deleted (0 or 1).
   */
  deleteOne(objId: string): Promise<number> {
    return this.dbService.getCollection<T>(this.collectionName).deleteOne({
      _id: new ObjectId(objId)
        // deno-lint-ignore no-explicit-any
    } as any);
  }

  /**
   * Deletes all documents from the collection.
   *
   * @returns {Promise<number>} A promise that resolves to the number of documents deleted.
   */
  deleteAll(): Promise<number> {
    return this.dbService.getCollection<T>(this.collectionName).deleteMany({});
  }
}
