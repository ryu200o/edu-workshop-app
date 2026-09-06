import type {
  BuildingMetadataView,
  CreateRoomRequest,
  PageEnvelope,
  RoomDetailView,
  RoomFilterParams,
  RoomSummaryView,
  ScheduleMaintenanceRequest,
  UpdateRoomProfileRequest,
} from "@/features/rooms/types";
import { apiClient } from "@/shared/api/client";

export const roomsApi = {
  getRooms: async (
    params?: RoomFilterParams,
  ): Promise<PageEnvelope<RoomSummaryView>> => {
    // Map 1-indexed UI page to 0-indexed API page
    const apiPage = Math.max(0, (params?.page ?? 1) - 1);

    const queryParams: Record<string, unknown> = {
      page: apiPage,
      size: params?.size ?? 10,
    };

    if (params?.sort) queryParams.sort = params.sort;
    if (params?.search) queryParams.search = params.search;
    if (params?.building) queryParams.building = params.building;
    if (params?.floor !== undefined) queryParams.floor = params.floor;
    if (params?.status) queryParams.status = params.status;
    if (params?.minCapacity !== undefined)
      queryParams.minCapacity = params.minCapacity;
    if (params?.maxCapacity !== undefined)
      queryParams.maxCapacity = params.maxCapacity;

    const response = await apiClient.get<PageEnvelope<RoomSummaryView>>(
      "/v1/rooms",
      {
        params: queryParams,
      },
    );
    return response.data;
  },

  getRoomById: async (id: string): Promise<RoomDetailView> => {
    const response = await apiClient.get<RoomDetailView>(`/v1/rooms/${id}`);
    return response.data;
  },

  getBuildings: async (): Promise<BuildingMetadataView[]> => {
    const response = await apiClient.get<BuildingMetadataView[]>(
      "/v1/rooms/buildings",
    );
    return response.data;
  },

  createRoom: async (
    payload: CreateRoomRequest,
    idempotencyKey: string,
  ): Promise<void> => {
    await apiClient.post("/v1/rooms", payload, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });
  },

  updateRoomProfile: async (
    id: string,
    payload: UpdateRoomProfileRequest,
    version: number,
  ): Promise<void> => {
    await apiClient.put(`/v1/rooms/${id}`, payload, {
      headers: {
        "If-Match": `"${version}"`,
      },
    });
  },

  placeUnderMaintenance: async (id: string): Promise<void> => {
    await apiClient.post(`/v1/rooms/${id}/maintenance`);
  },

  reactivateRoom: async (id: string, version?: number): Promise<void> => {
    const headers: Record<string, string> = {};
    if (version !== undefined) {
      headers["If-Match"] = `"${version}"`;
    }
    await apiClient.post(`/v1/rooms/${id}/reactivate`, null, { headers });
  },

  deactivateRoom: async (id: string, version?: number): Promise<void> => {
    const headers: Record<string, string> = {};
    if (version !== undefined) {
      headers["If-Match"] = `"${version}"`;
    }
    await apiClient.post(`/v1/rooms/${id}/deactivate`, null, { headers });
  },

  scheduleMaintenance: async (
    id: string,
    payload: ScheduleMaintenanceRequest,
    idempotencyKey: string,
    version?: number,
  ): Promise<void> => {
    const headers: Record<string, string> = {
      "Idempotency-Key": idempotencyKey,
    };
    if (version !== undefined) {
      headers["If-Match"] = `"${version}"`;
    }
    await apiClient.post(`/v1/rooms/${id}/maintenance-schedules`, payload, {
      headers,
    });
  },
};
