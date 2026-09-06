import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { roomsApi } from "@/features/rooms/api/rooms.api";
import type {
  CreateRoomRequest,
  RoomDetailView,
  RoomFilterParams,
  ScheduleMaintenanceRequest,
  UpdateRoomProfileRequest,
} from "@/features/rooms/types";

export const ROOM_QUERY_KEYS = {
  all: ["rooms"] as const,
  lists: () => [...ROOM_QUERY_KEYS.all, "list"] as const,
  list: (params?: RoomFilterParams) =>
    [...ROOM_QUERY_KEYS.lists(), params] as const,
  details: () => [...ROOM_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...ROOM_QUERY_KEYS.details(), id] as const,
  buildings: () => [...ROOM_QUERY_KEYS.all, "buildings"] as const,
};

export function useRoomsQuery(params?: RoomFilterParams) {
  return useQuery({
    queryKey: ROOM_QUERY_KEYS.list(params),
    queryFn: () => roomsApi.getRooms(params),
    staleTime: 30 * 1000,
  });
}

export function useRoomDetailQuery(id?: string) {
  return useQuery({
    queryKey: id ? ROOM_QUERY_KEYS.detail(id) : ["rooms", "detail", "empty"],
    queryFn: () => {
      if (!id) {
        throw new Error("Room ID is required");
      }
      return roomsApi.getRoomById(id);
    },
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}

export function useBuildingsQuery() {
  return useQuery({
    queryKey: ROOM_QUERY_KEYS.buildings(),
    queryFn: () => roomsApi.getBuildings(),
    staleTime: 60 * 60 * 1000, // 1 hour client cache
  });
}

/**
 * Silent refetch for in-place conflict reconciliation.
 * Fetches directly via roomsApi to bypass any stale TanStack Query RAM cache,
 * then updates the Query cache with the fresh RoomDetailView.
 */
export async function fetchLatestRoomDetail(
  queryClient: QueryClient,
  id: string,
): Promise<RoomDetailView> {
  const freshData = await roomsApi.getRoomById(id);
  queryClient.setQueryData(ROOM_QUERY_KEYS.detail(id), freshData);
  return freshData;
}

export function useCreateRoomMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      idempotencyKey,
    }: {
      payload: CreateRoomRequest;
      idempotencyKey: string;
    }) => roomsApi.createRoom(payload, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOM_QUERY_KEYS.all });
    },
  });
}

export interface UpdateRoomProfileVariables {
  id: string;
  payload: UpdateRoomProfileRequest;
  version: number;
}

export function useUpdateRoomProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload, version }: UpdateRoomProfileVariables) =>
      roomsApi.updateRoomProfile(id, payload, version),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ROOM_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: ROOM_QUERY_KEYS.detail(variables.id),
      });
    },
  });
}

export interface UpdateRoomVariables {
  id: string;
  original: {
    name: string;
    building: string;
    floor: number;
    code: number | string;
    capacity: number;
  };
  newValues: {
    name: string;
    building: string;
    floor: number;
    code: number;
    capacity: number;
  };
  version?: number;
}

/** @deprecated Use useUpdateRoomProfileMutation instead */
export function useUpdateRoomMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newValues, version = 0 }: UpdateRoomVariables) => {
      await roomsApi.updateRoomProfile(
        id,
        {
          name: newValues.name,
          building: newValues.building,
          floor: newValues.floor,
          code: newValues.code,
          capacity: newValues.capacity,
        },
        version,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ROOM_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: ROOM_QUERY_KEYS.detail(variables.id),
      });
    },
  });
}

export function useRoomStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      targetStatus,
      version,
    }: {
      id: string;
      targetStatus: "ACTIVE" | "MAINTENANCE" | "DEACTIVATED";
      version?: number;
    }) => {
      if (targetStatus === "MAINTENANCE") {
        await roomsApi.placeUnderMaintenance(id);
      } else if (targetStatus === "ACTIVE") {
        await roomsApi.reactivateRoom(id, version);
      } else if (targetStatus === "DEACTIVATED") {
        await roomsApi.deactivateRoom(id, version);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ROOM_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: ROOM_QUERY_KEYS.detail(variables.id),
      });
    },
  });
}

export function useScheduleMaintenanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
      idempotencyKey,
      version,
    }: {
      id: string;
      payload: ScheduleMaintenanceRequest;
      idempotencyKey: string;
      version?: number;
    }) => roomsApi.scheduleMaintenance(id, payload, idempotencyKey, version),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ROOM_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: ROOM_QUERY_KEYS.detail(variables.id),
      });
    },
  });
}
