import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roomsApi } from "@/features/rooms/api/rooms.api";
import type {
  CreateRoomRequest,
  RoomFilterParams,
  ScheduleMaintenanceRequest,
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
}

export function useUpdateRoomMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, original, newValues }: UpdateRoomVariables) => {
      // Crucial: Execute sequentially to prevent ObjectOptimisticLockingFailureException
      // on backend version column (409 Conflict)

      if (newValues.name !== original.name) {
        await roomsApi.renameRoom(id, { newName: newValues.name });
      }

      if (
        newValues.building !== original.building ||
        newValues.floor !== original.floor
      ) {
        await roomsApi.relocateRoom(id, {
          newBuilding: newValues.building,
          newFloor: newValues.floor,
        });
      }

      if (Number(newValues.code) !== Number(original.code)) {
        await roomsApi.changeRoomCode(id, { newCode: newValues.code });
      }

      if (newValues.capacity !== original.capacity) {
        await roomsApi.changeRoomCapacity(id, {
          newCapacity: newValues.capacity,
        });
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

export function useRoomStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      targetStatus,
    }: {
      id: string;
      targetStatus: "ACTIVE" | "MAINTENANCE" | "DEACTIVATED";
    }) => {
      if (targetStatus === "MAINTENANCE") {
        await roomsApi.placeUnderMaintenance(id);
      } else if (targetStatus === "ACTIVE") {
        await roomsApi.reactivateRoom(id);
      } else if (targetStatus === "DEACTIVATED") {
        await roomsApi.deactivateRoom(id);
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
    }: {
      id: string;
      payload: ScheduleMaintenanceRequest;
      idempotencyKey: string;
    }) => roomsApi.scheduleMaintenance(id, payload, idempotencyKey),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ROOM_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: ROOM_QUERY_KEYS.detail(variables.id),
      });
    },
  });
}
