/**
 * Event Settings Service
 * Handles event customization and settings management
 * 
 * NOTE: This file is deprecated. Use services/event-management/events-service.ts instead.
 * Kept for backward compatibility - re-exports from events-service.ts
 */

export {
  getEventDetails,
  customizeEvent,
  type UpdateEventCustomizePayload,
} from "./events-service";
