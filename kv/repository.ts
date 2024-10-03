
import type { KvService } from "./service.ts";
import type { Repository } from "../repository.ts";

/**
 * KV repository.
 * 
 * @template T - The type of the entity that extends an object with an `_id` string property.
 * @implements Repository<T>
 */
export abstract class KvRepository<T extends { _id: string }>
  implements Repository<T> {
  constructor(
    protected kv: KvService,
    public readonly collectionName: string,
  ) {
  }

  /**
   * Retrieves all items from the key-value store for the specified collection.
   *
   * @returns {Promise<T[]>} A promise that resolves to an array of items of type T.
   */
  async getAll(): Promise<T[]> {
    const items: T[] = [];
    for await (
      const entry of this.kv.client().list<T>({ prefix: [this.collectionName] })
    ) {
      items.push(entry.value);
    }
    return items;
  }

  /**
   * Retrieves an item by its id from the key-value store.
   *
   * @param id - The id of the item to retrieve.
   * @returns A promise that resolves to the item if found, or `undefined` if not found or if the id is not provided.
   */
  async getById(id: string): Promise<T|undefined> {
    if (!id) {
      return undefined;
    }
    const item = await this.kv.client().get([this.collectionName, id]);
    if (item) {
      return item.value as T;
    }
    return undefined;
  }

  /**
   * Creates a new item.
   *
   * This method performs an atomic transaction to set the primary key and any secondary keys
   * for the given item. If the transaction fails, an error is thrown.
   *
   * @template T - The type of the item to be created.
   * @param {T} item - The item to be created in the repository.
   * @returns {Promise<T>} - A promise that resolves to the created item.
   * @throws {Error} - Throws an error if the transaction fails.
   */
  async create(item: T): Promise<T> {
    const secondaryKeys = this.getSecondaryKeys(item);
    let transaction = this.kv.client().atomic()
      .set([this.collectionName, item._id], item);
    for (const secondaryKey of Object.keys(secondaryKeys)) {
      transaction = transaction.set(secondaryKeys[secondaryKey], item);
    }
    const transactionResult = await transaction.commit();
    if (!transactionResult.ok) {
      throw new Error("Could create entity");
    }
    return item;
  }

  /**
   * Deletes an item from the collection by its ID.
   * 
   * This method first retrieves the item by its ID. If the item does not exist,
   * the method returns immediately. If the item exists, it proceeds to delete
   * the item and its associated secondary keys in an atomic transaction.
   * 
   * @param itemId - The ID of the item to be deleted.
   * @returns A promise that resolves when the deletion is complete.
   */
  async deleteOne(itemId: string): Promise<void> {
    const item = await this.getById(itemId);
    if (!item) {
      return;
    }
    const secondaryKeys = this.getSecondaryKeys(item);
    let transaction = this.kv.client().atomic().delete([
      this.collectionName,
      item._id,
    ]);
    for (const secondaryKey of Object.keys(secondaryKeys)) {
      transaction = transaction.delete(secondaryKeys[secondaryKey]);
    }
    await transaction
      .commit();
  }

  /**
   * Updates an existing item in the database with the provided data.
   *
   * @template T - The type of the item to update.
   * @param {string} itemId - The unique identifier of the item to update.
   * @param {T} item - The new data to update the item with.
   * @returns {Promise<T>} - A promise that resolves to the updated item.
   * @throws {Error} - Throws an error if the transaction to update the item fails.
   */
  async updateOne(itemId: string, item: T): Promise<T> {
    const itemInDb = await this.kv.client().get([this.collectionName, itemId]);
    const itemToInsert = {
      ...itemInDb,
      ...item,
    };
    const secondaryKeys = this.getSecondaryKeys(item);
    let transaction = this.kv.client().atomic()
      .set([this.collectionName, item._id], itemToInsert);
    for (const secondaryKey of Object.keys(secondaryKeys)) {
      transaction = transaction.set(secondaryKeys[secondaryKey], itemToInsert);
    }
    const transactionResult = await transaction.commit();
    if (!transactionResult.ok) {
      throw new Error("Could update entity");
    }
    return itemToInsert;
  }

  /**
   * Deletes all entries in the key-value store that match the specified collection name.
   *
   * This method retrieves all entries with keys that have the specified prefix (collection name)
   * and deletes each one of them.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when all entries have been deleted.
   */
  async deleteAll() {
    const iter = await this.kv.client().list<T>({
      prefix: [this.collectionName],
    });
    for await (const res of iter) this.kv.client().delete(res.key);
  }

  /**
   * Retrieves the secondary keys for a given item.
   * 
   * @param _item - The item for which to retrieve secondary keys.
   * @returns An object where the keys are strings and the values are Deno.KvKey instances.
   */
  protected getSecondaryKeys(_item: T): Record<string, Deno.KvKey> {
    return {};
  }
}
