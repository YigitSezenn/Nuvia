import AsyncStorage from "@react-native-async-storage/async-storage";
import { emitDataChange } from "./dataEvents";

export async function getJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function setJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(error);
  }
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(["habits", "checkins"]);
  emitDataChange();
}
