export type RoomStatus = "ACTIVE" | "MAINTENANCE" | "DEACTIVATED";

export interface AuditActor {
  userId: string | null;
  identifier: string;
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
}

export interface CreateRoomRequest {
  building: string;
  floor: number;
  code: number;
  name: string;
  capacity: number;
}

export interface RenameRoomRequest {
  newName: string;
}

export interface RelocateRoomRequest {
  newBuilding: string;
  newFloor: number;
}

export interface ChangeRoomCodeRequest {
  newCode: number;
}

export interface ChangeRoomCapacityRequest {
  newCapacity: number;
}

export interface ScheduleMaintenanceRequest {
  startTime: string;
  endTime: string;
  reason?: string;
}
