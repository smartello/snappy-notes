<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Editor from '$lib/Editor.svelte';
  import StatusBar from '$lib/StatusBar.svelte';
  import TabBar from '$lib/TabBar.svelte';
  import type { LanguageId } from '$lib/types';
  import type { Tab } from '$lib/types';
  import { createTab } from '$lib/types';
  import { saveAppState, loadAppState } from '$lib/store';

  let tabs = $state<Tab[]>([]);
  let activeTabId = $state('');
  let editorRef = $state<ReturnType<typeof Editor> | undefined>(undefined);
  let ready = $state(false);

  let cursorLine = $state(1);
  let cursorCol = $state(1);
  let selectedChars = $state(0);
  let totalLines = $state(0);

  const activeTab = $derived(tabs.find(t => t.id === activeTabId));
  const currentLang = $derived<LanguageId>(activeTab?.language ?? 'plaintext');

  let tabCounter = 1;

  // Persist
  let saveInterval: ReturnType<typeof setInterval>;

  function snapshotActiveTab() {
    if (activeTab && editorRef) {
      activeTab.content = editorRef.getContent();
    }
  }

  function save() {
    snapshotActiveTab();
    saveAppState({ tabs, activeTabId });
  }

  onMount(async () => {
    const saved = await loadAppState();
    if (saved && saved.tabs.length > 0) {
      tabs = saved.tabs;
      activeTabId = saved.activeTabId;
      tabCounter = saved.tabs.length + 1;
    } else {
      const first = createTab(tabCounter++);
      first.content = `// Welcome to Snappy Notes ✨\n// A fast, lightweight editor powered by Tauri + SvelteKit + CodeMirror`;
      first.language = 'typescript';
      tabs = [first];
      activeTabId = first.id;
    }
    ready = true;

    // Apply language after editor mounts
    await new Promise((r) => setTimeout(r, 0));
    if (editorRef && activeTab) {
      editorRef.setLanguage(activeTab.language);
    }

    saveInterval = setInterval(save, 2000);
  });

  onDestroy(() => {
    clearInterval(saveInterval);
    save();
  });

  function handleCursorChange(info: { line: number; col: number; selected: number; totalLines: number; tabSize: number }) {
    cursorLine = info.line;
    cursorCol = info.col;
    selectedChars = info.selected;
    totalLines = info.totalLines;
  }

  function handleLanguageChange(lang: LanguageId) {
    if (activeTab) {
      activeTab.language = lang;
    }
    editorRef?.setLanguage(lang);
    save();
  }

  function selectTab(id: string) {
    if (id === activeTabId) return;
    snapshotActiveTab();
    activeTabId = id;
    const tab = tabs.find(t => t.id === id);
    if (tab && editorRef) {
      editorRef.setContent(tab.content);
      editorRef.setLanguage(tab.language);
      editorRef.focus();
    }
  }

  function closeTab(id: string) {
    if (tabs.length <= 1) return;
    snapshotActiveTab();
    const idx = tabs.findIndex(t => t.id === id);
    tabs = tabs.filter(t => t.id !== id);
    if (id === activeTabId) {
      const newIdx = Math.min(idx, tabs.length - 1);
      activeTabId = tabs[newIdx].id;
      const tab = tabs[newIdx];
      if (editorRef) {
        editorRef.setContent(tab.content);
        editorRef.setLanguage(tab.language);
        editorRef.focus();
      }
    }
    save();
  }

  function newTab() {
    snapshotActiveTab();
    const tab = createTab(tabCounter++);
    tabs = [...tabs, tab];
    activeTabId = tab.id;
    if (editorRef) {
      editorRef.setContent(tab.content);
      editorRef.setLanguage(tab.language);
      editorRef.focus();
    }
    save();
  }

  function renameTab(id: string, title: string) {
    const tab = tabs.find(t => t.id === id);
    if (tab) {
      tab.title = title;
      tabs = tabs;
      save();
    }
  }
</script>

<div class="app-shell">
  <TabBar
    {tabs}
    {activeTabId}
    onSelect={selectTab}
    onClose={closeTab}
    onNew={newTab}
    onRename={renameTab}
  />

  <div class="editor-area">
    <div class="activity-bar">
      <button class="activity-icon active" aria-label="Explorer" title="Explorer">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.5 0h-9L7 1.5V6H2.5L1 7.5v15.07L2.5 24h12.07L16 22.57V18h4.7l1.3-1.43V4.5L17.5 0zm0 2.12l2.38 2.38H17.5V2.12zm-3 20.38h-12v-15H7v9.07L8.5 18h6v4.5zm6-6h-12v-15H16V6h4.5v10.5z"/>
        </svg>
      </button>
      <button class="activity-icon" aria-label="Search" title="Search">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.25 0a8.25 8.25 0 0 0-6.18 13.72L1 22.88l1.12 1.12 8.05-9.12A8.251 8.251 0 1 0 15.25.01V0zm0 15a6.75 6.75 0 1 1 0-13.5 6.75 6.75 0 0 1 0 13.5z"/>
        </svg>
      </button>
    </div>

    <div class="editor-content">
      {#if ready && activeTab}
        <Editor
          bind:this={editorRef}
          onCursorChange={handleCursorChange}
          initialContent={activeTab.content}
          initialLanguage={activeTab.language}
        />
      {/if}
    </div>
  </div>

  <StatusBar
    line={cursorLine}
    col={cursorCol}
    selected={selectedChars}
    {totalLines}
    {currentLang}
    onLanguageChange={handleLanguageChange}
  />
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(html, body) {
    height: 100%;
    overflow: hidden;
    background-color: #1e1e1e;
    color: #cccccc;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
  }

  .app-shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }

  .editor-area {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .activity-bar {
    width: 48px;
    background-color: #333333;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 4px;
    gap: 2px;
    flex-shrink: 0;
  }

  .activity-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: #858585;
    cursor: pointer;
    border-left: 2px solid transparent;
    transition: color 0.1s;
  }

  .activity-icon:hover {
    color: #cccccc;
  }

  .activity-icon.active {
    color: #ffffff;
    border-left-color: #ffffff;
  }

  .editor-content {
    flex: 1;
    overflow: hidden;
  }
</style>
