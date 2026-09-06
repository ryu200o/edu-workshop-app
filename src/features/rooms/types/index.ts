export type RoomStatus = "ACTIVE" | "MAINTENANCE" | "DEACTIVATED";

export interface AuditActor {
  userId: string | null;
  identifier: string;
  email?: string;
  displayName?: string;
  roles: string[];
}

export interface MaintenanceScheduleView {
  id: string;
  roomId?: string;
  startTime: string;
  endTime: string;
  reason?: string;
  createdBy?: AuditActor;
  createdAt?: string;
}

export interface RoomSummaryView {
  id: string;
  name: string;
  building: string;
  floor: number;
  code: number | string;
  capacity: number;
  state: RoomStatus;
  version: number;
  createdAt?: string;
  currentMaintenanceSchedule?: MaintenanceScheduleView | null;
}

export interface RoomDetailView {
  id: string;
  name: string;
  building: string;
  floor: number;
  code: number | string;
  capacity: number;
  state: RoomStatus;
  version: number;
  createdBy?: AuditActor;
  updatedBy?: AuditActor;
  createdAt?: string;
  updatedAt?: string;
  maintenanceSchedules?: MaintenanceScheduleView[];
}

export interface PageEnvelope<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface BuildingMetadataView {
  building: string;
  floors: number[];
  totalRooms: number;
}

export interface RoomFilterParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  building?: string;
  floor?: number;
  status?: RoomStatus;
  minCapacity?: number;
  maxCapacity?: number;
  view?: "table" | "grid";
}

export interface CreateRoomRequest {
  building: string;
  floor: number;
  code: number;
  name: string;
  capacity: number;
}

export interface UpdateRoomProfileRequest {
  name: string;
  building: string;
  floor: number;
  code: number;
  capacity: number;
}

export type UpdateRoomProfilePayload = UpdateRoomProfileRequest;

export interface ScheduleMaintenanceRequest {
  startTime: string;
  endTime: string;
  reason?: string;
}
