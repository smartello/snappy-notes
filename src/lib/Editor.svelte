<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EditorState, Compartment } from '@codemirror/state';
  import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';
  import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
  import { syntaxHighlighting, defaultHighlightStyle, indentOnInput, bracketMatching, foldGutter, foldKeymap, getIndentUnit } from '@codemirror/language';
  import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from '@codemirror/autocomplete';
  import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
  import { lintKeymap } from '@codemirror/lint';
  import { javascript } from '@codemirror/lang-javascript';
  import { markdown } from '@codemirror/lang-markdown';
  import { oneDark } from '@codemirror/theme-one-dark';

  import type { LanguageId } from './types';
  export type { LanguageId };

  const languageExtensions: Record<LanguageId, () => import('@codemirror/state').Extension> = {
    typescript: () => javascript({ typescript: true }),
    markdown: () => markdown(),
    plaintext: () => [],
  };

  const languageCompartment = new Compartment();

  interface CursorInfo {
    line: number;
    col: number;
    selected: number;
    totalLines: number;
    tabSize: number;
  }

  let { onCursorChange, initialContent, initialLanguage }: {
    onCursorChange?: (info: CursorInfo) => void;
    initialContent?: string;
    initialLanguage?: LanguageId;
  } = $props();

  let editorContainer: HTMLDivElement;
  let view: EditorView;

  export function setLanguage(lang: LanguageId) {
    if (view) {
      view.dispatch({
        effects: languageCompartment.reconfigure(languageExtensions[lang]()),
      });
      view.focus();
    }
  }

  export function getContent(): string {
    return view?.state.doc.toString() ?? '';
  }

  export function setContent(content: string) {
    if (view) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: content },
      });
    }
  }

  export function focus() {
    view?.focus();
  }

  const cursorTracker = EditorView.updateListener.of((update) => {
    if (update.selectionSet || update.docChanged) {
      const state = update.state;
      const pos = state.selection.main.head;
      const line = state.doc.lineAt(pos);
      const selected = Math.abs(state.selection.main.to - state.selection.main.from);
      onCursorChange?.({
        line: line.number,
        col: pos - line.from + 1,
        selected,
        totalLines: state.doc.lines,
        tabSize: getIndentUnit(state),
      });
    }
  });

  const vsCodeTheme = EditorView.theme({
    '&': {
      height: '100%',
      fontSize: '14px',
      fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
    },
    '.cm-content': {
      caretColor: '#aeafad',
      padding: '4px 0',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#aeafad',
      borderLeftWidth: '2px',
    },
    '.cm-gutters': {
      backgroundColor: '#1e1e1e',
      color: '#858585',
      border: 'none',
      minWidth: '48px',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#2a2d2e',
      color: '#c6c6c6',
    },
    '.cm-activeLine': {
      backgroundColor: '#2a2d2e44',
    },
    '.cm-selectionMatch': {
      backgroundColor: '#add6ff26',
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: '#264f78 !important',
    },
    '.cm-panels': {
      backgroundColor: '#252526',
      color: '#cccccc',
    },
    '.cm-searchMatch': {
      backgroundColor: '#515c6a',
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: '#ea5c0055',
    },
    '.cm-foldGutter .cm-gutterElement': {
      cursor: 'pointer',
    },
  });

  const defaultContent = `// Welcome to Snappy Notes ✨
// A fast, lightweight editor powered by Tauri + SvelteKit + CodeMirror`;

  onMount(() => {
    const lang = initialLanguage ?? 'typescript';
    const state = EditorState.create({
      doc: initialContent ?? defaultContent,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
          ...lintKeymap,
          indentWithTab,
        ]),
        languageCompartment.of(languageExtensions['typescript']()),
        oneDark,
        vsCodeTheme,
        cursorTracker,
        EditorView.lineWrapping,
      ],
    });

    view = new EditorView({
      state,
      parent: editorContainer,
    });

    // Emit initial cursor info
    const pos = state.selection.main.head;
    const line = state.doc.lineAt(pos);
    onCursorChange?.({
      line: line.number,
      col: pos - line.from + 1,
      selected: 0,
      totalLines: state.doc.lines,
      tabSize: getIndentUnit(state),
    });
  });

  onDestroy(() => {
    view?.destroy();
  });
</script>

<div class="editor-wrapper" bind:this={editorContainer}></div>

<style>
  .editor-wrapper {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .editor-wrapper :global(.cm-editor) {
    height: 100%;
  }

  .editor-wrapper :global(.cm-scroller) {
    overflow: auto;
  }
</style>
