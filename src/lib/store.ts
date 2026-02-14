import { load } from '@tauri-apps/plugin-store';
import type { LanguageId } from './Editor.svelte';

interface EditorState {
  content: string;
  language: LanguageId;
}

const STORE_FILE = 'editor-state.json';
const KEY = 'editor';

let storeInstance: Awaited<ReturnType<typeof load>> | null = null;

async function getStore() {
  if (!storeInstance) {
    storeInstance = await load(STORE_FILE, { autoSave: true });
  }
  return storeInstance;
}

export async function saveEditorState(state: EditorState): Promise<void> {
  const store = await getStore();
  await store.set(KEY, state);
}

export async function loadEditorState(): Promise<EditorState | null> {
  const store = await getStore();
  return await store.get<EditorState>(KEY) ?? null;
}
