/**
 * Category DTO
 */

export interface CategoryNodeDto {
  id: string;
  name: string;
  parentId?: string | null;
  children: CategoryNodeDto[];
}
