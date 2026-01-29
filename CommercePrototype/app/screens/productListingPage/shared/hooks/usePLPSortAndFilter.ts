import { useState } from "react";
import type { SortOption } from "../../../../types";

export function usePLPSortAndFilter(initialSort: SortOption) {
  const [sortVisible, setSortVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>(initialSort);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const openSortMenu = () => setSortVisible(true);
  const closeSortMenu = () => setSortVisible(false);
  const openFilterMenu = () => setFilterVisible(true);
  const closeFilterMenu = () => setFilterVisible(false);

  const handleSortSelect = (value: SortOption) => {
    setSelectedSort(value);
    closeSortMenu();
  };

  const handleFilterSelect = (query: string) => {
    setSelectedCategory(query);
    closeFilterMenu();
  };

  return {
    sortVisible,
    filterVisible,
    selectedSort,
    selectedCategory,
    openSortMenu,
    closeSortMenu,
    openFilterMenu,
    closeFilterMenu,
    handleSortSelect,
    handleFilterSelect,
    setSelectedSort,
    setSelectedCategory,
  };
}
