import { fail } from "@/lib/http";
import { ServiceError } from "@/server/service-error";

export async function handleRoute<T>(operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ServiceError) {
      return fail(error.message, error.status, error.details);
    }

    throw error;
  }
}
