import { SchedulerId } from "@/types/scheduler";

export function getStorageSchedulerId(id: string): SchedulerId {
  return `storage-${id}` as SchedulerId;
}
