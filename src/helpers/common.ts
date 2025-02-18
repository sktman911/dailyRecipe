import { Filter } from "../types/requestParams";

export const parseFilterParams = (filter: any[]) => {
  const result: Filter[] = [];

  if (Array.isArray(filter)) {
    if (Array.isArray(filter[0])) {
      for (var item of filter) {
        if (Array.isArray(item)) {
          result.push({
            field: String(item[0]),
            operator: item[1],
            value: String(item[2]),
          });
        }
      }
    } else {
      result.push({
        field: String(filter[0]),
        operator: filter[1],
        value: String(filter[2]),
      });
    }
  }
  return result;
};
