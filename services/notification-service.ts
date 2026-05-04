import { apiGet, apiPatch } from '@/lib/admin-api';
import { parseApiResponse } from '@/lib/validation/parse-api-response';
import { z } from 'zod';

export const NotificationPreferencesSchema = z.object({
  registration_confirmation: z.boolean(),
  payment_status: z.boolean(),
  lot_assignment: z.boolean(),
});

export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const data = await apiGet<unknown>('/auth/notification-preferences');
  return parseApiResponse(NotificationPreferencesSchema, data, 'getNotificationPreferences');
}

export async function updateNotificationPreferences(
  prefs: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const data = await apiPatch<unknown>('/auth/notification-preferences', prefs);
  return parseApiResponse(NotificationPreferencesSchema, data, 'updateNotificationPreferences');
}
