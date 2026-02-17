<script lang="ts">
  import type { LanguageId } from './Editor.svelte';

  interface Props {
    line: number;
    col: number;
    selected: number;
    totalLines: number;
    currentLang: LanguageId;
    onLanguageChange: (lang: LanguageId) => void;
  }

  let { line, col, selected, totalLines, currentLang, onLanguageChange }: Props = $props();

  const languages: { id: LanguageId; label: string }[] = [
    { id: 'typescript', label: 'TypeScript' },
    { id: 'markdown', label: 'Markdown' },
    { id: 'plaintext', label: 'Plain Text' },
  ];

  let showLangPicker = $state(false);

  const currentLangLabel = $derived(languages.find(l => l.id === currentLang)?.label ?? 'Plain Text');

  function selectLanguage(lang: LanguageId) {
    showLangPicker = false;
    onLanguageChange(lang);
  }

  function handlePickerKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') showLangPicker = false;
  }
</script>

<div class="status-bar">
  <div class="status-left">
    <span class="status-item">Ln {line}, Col {col}{selected > 0 ? ` (${selected} selected)` : ''}</span>
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

<style>
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
