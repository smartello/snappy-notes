<script lang="ts">
  import Editor from '$lib/Editor.svelte';
  import type { LanguageId } from '$lib/Editor.svelte';

  let cursorLine = $state(1);
  let cursorCol = $state(1);
  let selectedChars = $state(0);
  let totalLines = $state(0);
  let tabSize = $state(2);

  const languages: { id: LanguageId; label: string }[] = [
    { id: 'typescript', label: 'TypeScript' },
    { id: 'markdown', label: 'Markdown' },
    { id: 'plaintext', label: 'Plain Text' },
  ];

  let currentLang = $state<LanguageId>('typescript');
  let showLangPicker = $state(false);
  let editorRef: ReturnType<typeof Editor> | undefined;

  function handleCursorChange(info: { line: number; col: number; selected: number; totalLines: number; tabSize: number }) {
    cursorLine = info.line;
    cursorCol = info.col;
    selectedChars = info.selected;
    totalLines = info.totalLines;
    tabSize = info.tabSize;
  }

  function selectLanguage(lang: LanguageId) {
    currentLang = lang;
    showLangPicker = false;
    editorRef?.setLanguage(lang);
  }

  function handlePickerKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') showLangPicker = false;
  }

  const currentLangLabel = $derived(languages.find(l => l.id === currentLang)?.label ?? 'Plain Text');
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
      <Editor bind:this={editorRef} onCursorChange={handleCursorChange} />
    </div>
  </div>

  <!-- Status bar -->
  <div class="status-bar">
    <div class="status-left">
      <span class="status-item">Ln {cursorLine}, Col {cursorCol}{selectedChars > 0 ? ` (${selectedChars} selected)` : ''}</span>
      <span class="status-item">{totalLines} lines</span>
    </div>
    <div class="status-right">
      <div class="lang-picker-wrapper">
        <button class="status-item status-btn" onclick={() => showLangPicker = !showLangPicker}>
          {currentLangLabel}
        </button>
        {#if showLangPicker}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div class="lang-picker" onkeydown={handlePickerKeydown}>
            {#each languages as lang}
              <button
                class="lang-option"
                class:active={lang.id === currentLang}
                onclick={() => selectLanguage(lang.id)}
              >
                {lang.label}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
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

  .status-bar {
    height: 22px;
    background-color: #007acc;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    flex-shrink: 0;
    -webkit-user-select: none;
    user-select: none;
  }

  .status-left, .status-right {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .status-item {
    font-size: 12px;
    color: #ffffff;
  }

  .status-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0 4px;
    border-radius: 3px;
    font-family: inherit;
    font-size: 12px;
    color: #ffffff;
    line-height: 22px;
    margin: 0;
    transform: translateY(1px);
  }

  .status-btn:hover {
    background-color: rgba(255, 255, 255, 0.12);
  }

  .lang-picker-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .lang-picker {
    position: absolute;
    bottom: 26px;
    right: 0;
    background-color: #252526;
    border: 1px solid #3c3c3c;
    border-radius: 4px;
    padding: 4px 0;
    min-width: 140px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    z-index: 100;
  }

  .lang-option {
    display: block;
    width: 100%;
    padding: 4px 12px;
    background: none;
    border: none;
    color: #cccccc;
    font-size: 13px;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
  }

  .lang-option:hover {
    background-color: #094771;
    color: #ffffff;
  }

  .lang-option.active {
    color: #ffffff;
    background-color: #04395e;
  }
</style>
