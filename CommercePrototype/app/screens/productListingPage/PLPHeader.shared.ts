import { useState, useCallback, useMemo } from "react";
import type { SortOption } from "../../scripts/helpers/productHelpers";
import { SORT_OPTIONS } from "../../scripts/helpers/productHelpers";
import { capitalizeFirst } from "../../scripts/helpers/stringHelpers";

/**
 * Shared logic for PLPHeader (both web and native)
 */
export function usePLPHeaderLogic(
    query: string | undefined,
    productCount: number,
    selectedSort: SortOption,
    onSortChange: (sort: SortOption) => void,
    onCategorySelect: (query: string) => void
) {
    const [sortVisible, setSortVisible] = useState(false);
    const [filterVisible, setFilterVisible] = useState(false);

    const title = useMemo(
        () => (query ? capitalizeFirst(query) : "All Products"),
        [query]
    );

    const countText = useMemo(
        () => `${productCount} ${productCount === 1 ? "product" : "products"}`,
        [productCount]
    );

    const selectedOption = useMemo(
        () => SORT_OPTIONS.find((opt) => opt.value === selectedSort),
        [selectedSort]
    );

    const openSortMenu = useCallback(() => setSortVisible(true), []);
    const closeSortMenu = useCallback(() => setSortVisible(false), []);
    const openFilterMenu = useCallback(() => setFilterVisible(true), []);
    const closeFilterMenu = useCallback(() => setFilterVisible(false), []);

    const handleSortSelect = useCallback(
        (value: SortOption) => {
        onSortChange(value);
        closeSortMenu();
        },
        [onSortChange, closeSortMenu]
    );

    const handleFilterSelect = useCallback(
        (filterQuery: string) => {
        onCategorySelect(filterQuery);
        closeFilterMenu();
        },
        [onCategorySelect, closeFilterMenu]
    );

    return {
        title,
        countText,
        selectedOption,
        sortVisible,
        filterVisible,
        openSortMenu,
        closeSortMenu,
        openFilterMenu,
        closeFilterMenu,
        handleSortSelect,
        handleFilterSelect,
    };
}
