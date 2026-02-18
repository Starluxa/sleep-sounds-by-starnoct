/**
 * Base class for Entities in the Domain.
 * Entities have a unique identity that persists over time.
 */
export abstract class Entity<T, ID> {
  protected readonly _id: ID;
  protected readonly props: T;

  constructor(props: T, id: ID) {
    this._id = id;
    this.props = props;
  }

  get id(): ID {
    return this._id;
  }

  public equals(object?: Entity<T, ID>): boolean {
    if (object === null || object === undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    return this._id === object._id;
  }
}
