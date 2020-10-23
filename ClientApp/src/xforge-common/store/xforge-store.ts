import { buildQuery, QueryOrExpression, Transform } from '@orbit/data';
import Store, { PatchResultData, StoreSettings } from '@orbit/store';

import { QueryOperators } from './query-operators';

export class XForgeStore extends Store {
  constructor(settings: StoreSettings = {}) {
    super(settings);
    // override this method so that we can support custom filters in Orbit
    this.cache.query = function(queryOrExpression: QueryOrExpression, options?: object, id?: string): any {
      const query = buildQuery(queryOrExpression, options, id, this._queryBuilder);
      const operator = QueryOperators[query.expression.op];
      if (!operator) {
        throw new Error('Unable to find operator: ' + query.expression.op);
      }
      return operator(this, query.expression, query.options);
    };
  }

  protected _applyTransform(transform: Transform): PatchResultData[] {
    const results = super._applyTransform(transform);
    // emit an event after transform has been applied
    this.emit('transform_completed', transform, results);
    return results;
  }
}
