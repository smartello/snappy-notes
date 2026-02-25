import { load } from '@tauri-apps/plugin-store';
import type { Tab } from './types';

interface AppState {
  tabs: Tab[];
  activeTabId: string;
}

const STORE_FILE = 'editor-state.json';
const KEY = 'app';

let storeInstance: Awaited<ReturnType<typeof load>> | null = null;

async function getStore() {
  if (!storeInstance) {
    storeInstance = await load(STORE_FILE, { autoSave: true } as any);
  }
  return storeInstance;
}

export async function saveAppState(state: AppState): Promise<void> {
  const store = await getStore();
  await store.set(KEY, state);
}

export async function loadAppState(): Promise<AppState | null> {
  const store = await getStore();
  return await store.get<AppState>(KEY) ?? null;
}
