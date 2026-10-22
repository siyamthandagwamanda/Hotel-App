import type { Filters } from "../slices/searchSlice";

export function countActiveFilters(filters: Filters): number {
    let count = 0;

    if (filters.minPrice !== null || filters.maxPrice !== null){
        count++;
    }

    if (filters.stars !== null){
        count++;
    }

    if (filters.propertyType !== null){
        count++;
    }

    if (filters.amenityIds.length > 0){
        count++;
    }

    return count;
}