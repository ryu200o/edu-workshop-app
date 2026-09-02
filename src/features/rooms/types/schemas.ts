import { z } from "zod";

export const auditActorSchema = z.object({
  userId: z.string().uuid().nullable(),
  identifier: z.string(),
  roles: z.array(z.string()),
});

export const createRoomSchema = z.object({
  building: z
    .string()
    .trim()
    .min(1, "Tòa nhà không được để trống")
    .max(50, "Tối đa 50 ký tự"),
  floor: z.coerce
    .number()
    .int("Tầng phải là số nguyên")
    .min(-5, "Tầng hầm tối đa -5")
    .max(100, "Tầng tối đa 100"),
  code: z.coerce
    .number()
    .int("Mã phòng phải là số nguyên")
    .positive("Mã phòng phải là số nguyên dương"),
  name: z
    .string()
    .trim()
    .min(1, "Tên phòng không được để trống")
    .max(100, "Tên phòng tối đa 100 ký tự"),
  capacity: z.coerce
    .number()
    .int("Sức chứa phải là số nguyên")
    .min(1, "Sức chứa tối thiểu 1 người")
    .max(2000, "Sức chứa tối đa 2000 người"),
});

export type CreateRoomFormValues = z.infer<typeof createRoomSchema>;

export const editRoomSchema = z.object({
  building: z
    .string()
    .trim()
    .min(1, "Tòa nhà không được để trống")
    .max(50, "Tối đa 50 ký tự"),
  floor: z.coerce
    .number()
    .int("Tầng phải là số nguyên")
    .min(-5, "Tầng hầm tối đa -5")
    .max(100, "Tầng tối đa 100"),
  code: z.coerce
    .number()
    .int("Mã phòng phải là số nguyên")
    .positive("Mã phòng phải là số nguyên dương"),
  name: z
    .string()
    .trim()
    .min(1, "Tên phòng không được để trống")
    .max(100, "Tên phòng tối đa 100 ký tự"),
  capacity: z.coerce
    .number()
    .int("Sức chứa phải là số nguyên")
    .min(1, "Sức chứa tối thiểu 1 người")
    .max(2000, "Sức chứa tối đa 2000 người"),
});

export type EditRoomFormValues = z.infer<typeof editRoomSchema>;

export const scheduleMaintenanceSchema = z
  .object({
    startTime: z.string().min(1, "Thời gian bắt đầu không được để trống"),
    endTime: z.string().min(1, "Thời gian kết thúc không được để trống"),
    reason: z.string().trim().max(255, "Lý do tối đa 255 ký tự").optional(),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      return new Date(data.endTime) > new Date(data.startTime);
    },
    {
      message: "Thời gian kết thúc phải sau thời gian bắt đầu",
      path: ["endTime"],
    },
  );

export type ScheduleMaintenanceFormValues = z.infer<
  typeof scheduleMaintenanceSchema
>;

export const roomSearchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  size: z.coerce.number().int().min(1).max(100).optional().default(10),
  sort: z.string().optional().default("building,asc"),
  search: z.string().optional(),
  building: z.string().optional(),
  floor: z.coerce.number().int().optional(),
  status: z.enum(["ACTIVE", "MAINTENANCE", "DEACTIVATED"]).optional(),
  minCapacity: z.coerce.number().int().positive().optional(),
  maxCapacity: z.coerce.number().int().positive().optional(),
});

export type RoomSearchParams = z.infer<typeof roomSearchParamsSchema>;
