<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Editor from '$lib/Editor.svelte';
  import StatusBar from '$lib/StatusBar.svelte';
  import type { LanguageId } from '$lib/Editor.svelte';
  import { saveEditorState, loadEditorState } from '$lib/store';

  let cursorLine = $state(1);
  let cursorCol = $state(1);
  let selectedChars = $state(0);
  let totalLines = $state(0);

  let currentLang = $state<LanguageId>('typescript');
  let editorRef = $state<ReturnType<typeof Editor> | undefined>(undefined);
  let ready = $state(false);
  let initialContent = $state<string | undefined>(undefined);
  let initialLanguage = $state<LanguageId | undefined>(undefined);

  // Load persisted state before mounting editor
  let saveInterval: ReturnType<typeof setInterval>;
  onMount(async () => {
    const saved = await loadEditorState();
    if (saved) {
      initialContent = saved.content;
      initialLanguage = saved.language;
      currentLang = saved.language;
    }
    ready = true;

    // Apply language after editor mounts (next tick)
    await new Promise((r) => setTimeout(r, 0));
    if (saved && editorRef) {
      editorRef.setLanguage(saved.language);
    }

    // Start auto-save only after state is loaded
    saveInterval = setInterval(() => {
      if (editorRef) {
        saveEditorState({ content: editorRef.getContent(), language: currentLang });
      }
    }, 2000);
  });

  onDestroy(() => {
    clearInterval(saveInterval);
    // Final save
    if (editorRef) {
      saveEditorState({ content: editorRef.getContent(), language: currentLang });
    }
  });

  function handleCursorChange(info: { line: number; col: number; selected: number; totalLines: number; tabSize: number }) {
    cursorLine = info.line;
    cursorCol = info.col;
    selectedChars = info.selected;
    totalLines = info.totalLines;
  }

  function handleLanguageChange(lang: LanguageId) {
    currentLang = lang;
    editorRef?.setLanguage(lang);
    if (editorRef) {
      saveEditorState({ content: editorRef.getContent(), language: lang });
    }
  }
</script>

<div class="app-shell">
  <!-- Status bar top (tabs area) -->
  <div class="tab-bar">
    <div class="tab active">
      <span class="tab-icon">TS</span>
      <span>untitled-1.ts</span>
    </div>
  </div>

  <!-- Editor area -->
  <div class="editor-area">
    <!-- Activity bar (icon sidebar) -->
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

    <!-- Main editor -->
    <div class="editor-content">
      {#if ready}
        <Editor bind:this={editorRef} onCursorChange={handleCursorChange} {initialContent} {initialLanguage} />
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

  .tab-bar {
    height: 35px;
    background-color: #252526;
    display: flex;
    align-items: flex-end;
    flex-shrink: 0;
    border-bottom: 1px solid #1e1e1e;
  }

  .tab {
    height: 35px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: #1e1e1e;
    color: #cccccc;
    font-size: 13px;
    border-right: 1px solid #252526;
    cursor: pointer;
    -webkit-user-select: none;
    user-select: none;
  }

  .tab.active {
    background-color: #1e1e1e;
    border-top: 1px solid #007acc;
  }

  .tab-icon {
    font-size: 10px;
    font-weight: 700;
    color: #519aba;
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
