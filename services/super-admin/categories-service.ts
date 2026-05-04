import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/admin-api";
import { parseApiResponse } from "@/lib/validation/parse-api-response";
import { z } from "zod";
import { CategoryReadSchema } from "@/lib/validation/schemas/event.schema";

export type Category = z.infer<typeof CategoryReadSchema>;

/**
 * Get all categories for an event
 * @param eventId Event ID
 * @returns List of competition categories
 */
export async function getEventCategories(eventId: string): Promise<Category[]> {
  const data = await apiGet<unknown>(`/superadmin/events/${eventId}/categories`);
  return parseApiResponse(z.array(CategoryReadSchema), data, "getEventCategories");
}

// Create category request schema - aligned with CreateCategoryPayload in types/admin.ts
const CreateCategorySchema = z.object({
  name: z.string(),
  event_id: z.string(),
  max_quota: z.number().nonnegative(),
  registration_fee: z.number().min(0),
});

export type CreateCategoryRequest = z.infer<typeof CreateCategorySchema>;

/**
 * Create a new competition category
 * @param eventId Event ID
 * @param payload Category creation data
 * @returns Created category
 */
export async function createCategory(
  eventId: string,
  payload: CreateCategoryRequest
): Promise<Category> {
  const validatedPayload = CreateCategorySchema.parse(payload);
  const data = await apiPost<unknown>(`/superadmin/events/${eventId}/categories`, validatedPayload);
  return parseApiResponse(CategoryReadSchema, data, "createCategory");
}

// Update category request schema - aligned with UpdateCategoryPayload in types/admin.ts
const UpdateCategorySchema = z.object({
  name: z.string().optional(),
  max_quota: z.number().nonnegative().optional(),
  registration_fee: z.number().min(0).optional(),
});

export type UpdateCategoryRequest = z.infer<typeof UpdateCategorySchema>;

/**
 * Update an existing category
 * @param categoryId Category ID
 * @param payload Category update data
 * @returns Updated category
 */
export async function updateCategory(
  categoryId: string,
  payload: UpdateCategoryRequest
): Promise<Category> {
  const validatedPayload = UpdateCategorySchema.parse(payload);
  const data = await apiPatch<unknown>(`/superadmin/categories/${categoryId}`, validatedPayload);
  return parseApiResponse(CategoryReadSchema, data, "updateCategory");
}

/**
 * Delete a category
 * @param categoryId Category ID to delete
 * @returns Success message
 */
export async function deleteCategory(categoryId: string): Promise<{ message: string; category_id: string }> {
  const data = await apiDelete<unknown>(`/superadmin/categories/${categoryId}`);
  return parseApiResponse(
    z.object({ message: z.string(), category_id: z.string() }),
    data,
    "deleteCategory"
  );
}

// Note: getCategorySchema and uploadCategorySchema are exported from scoring-service.ts
