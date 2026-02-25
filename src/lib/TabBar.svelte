<script lang="ts">
  import type { Tab } from './types';

  interface Props {
    tabs: Tab[];
    activeTabId: string;
    onSelect: (id: string) => void;
    onClose: (id: string) => void;
    onNew: () => void;
  }

  let { tabs, activeTabId, onSelect, onClose, onNew }: Props = $props();

  const langIcons: Record<string, string> = {
    typescript: 'TS',
    markdown: 'MD',
    plaintext: 'TXT',
  };
</script>

<div class="tab-bar">
  {#each tabs as tab (tab.id)}
    <button
      class="tab"
      class:active={tab.id === activeTabId}
      onclick={() => onSelect(tab.id)}
    >
      <span class="tab-icon">{langIcons[tab.language] ?? 'TXT'}</span>
      <span class="tab-title">{tab.title}</span>
      {#if tabs.length > 1}
        <button
          class="tab-close"
          aria-label="Close tab"
          onclick={(e: MouseEvent) => { e.stopPropagation(); onClose(tab.id); }}
        >×</button>
      {/if}
    </button>
  {/each}
  <button class="tab-new" aria-label="New tab" onclick={onNew}>+</button>
</div>

<style>
  .tab-bar {
    height: 35px;
    background-color: #252526;
    display: flex;
    align-items: flex-end;
    flex-shrink: 0;
    border-bottom: 1px solid #1e1e1e;
    overflow-x: auto;
  }

  .tab-bar::-webkit-scrollbar {
    display: none;
  }

  .tab {
    height: 35px;
    padding: 0 10px;
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: #2d2d2d;
    color: #969696;
    font-size: 13px;
    font-family: inherit;
    border: none;
    border-right: 1px solid #252526;
    cursor: pointer;
    -webkit-user-select: none;
    user-select: none;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .tab.active {
    background-color: #1e1e1e;
    color: #cccccc;
    border-top: 1px solid #007acc;
  }

  .tab-icon {
    font-size: 10px;
    font-weight: 700;
    color: #519aba;
  }

  .tab-title {
    pointer-events: none;
  }

  .tab-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    background: none;
    border: none;
    border-radius: 3px;
    color: #969696;
    font-size: 14px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    font-family: inherit;
  }

  .tab-close:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  .tab-new {
    height: 35px;
    width: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: #969696;
    font-size: 18px;
    cursor: pointer;
    flex-shrink: 0;
    font-family: inherit;
  }

  .tab-new:hover {
    color: #cccccc;
  }
</style>
