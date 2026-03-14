/**
 * ALONE CODE STUDIO v3 — main.js
 * Vue 3 + CodeMirror 6 + Piston API + Enhanced AI + Tree Explorer + Split View + Terminal
 * Upgraded with JSON, YAML, Dart, R, Scala support.
 */

import { EditorState, Compartment } from "@codemirror/state";
import {
  EditorView, keymap, lineNumbers, drawSelection,
  highlightActiveLine, highlightActiveLineGutter,
  rectangularSelection, crosshairCursor,
} from "@codemirror/view";
import {
  defaultKeymap, history, historyKeymap,
  indentWithTab, toggleComment,
} from "@codemirror/commands";
import {
  syntaxHighlighting, defaultHighlightStyle,
  indentOnInput, bracketMatching, foldGutter,
} from "@codemirror/language";
import { search, searchKeymap } from "@codemirror/search";
import { autocompletion, closeBrackets, completionKeymap } from "@codemirror/autocomplete";
import { oneDark } from "@codemirror/theme-one-dark";

import { python }     from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { cpp }        from "@codemirror/lang-cpp";
import { java }       from "@codemirror/lang-java";
import { rust }       from "@codemirror/lang-rust";
import { go }         from "@codemirror/lang-go";
import { php }        from "@codemirror/lang-php";
import { html }       from "@codemirror/lang-html";
import { css }        from "@codemirror/lang-css";
import { sql }        from "@codemirror/lang-sql";
import { xml }        from "@codemirror/lang-xml";
import { markdown }   from "@codemirror/lang-markdown";
import { json }       from "@codemirror/lang-json";
import { yaml }       from "@codemirror/lang-yaml";

const { createApp, ref, computed, onMounted, nextTick, watch, defineComponent } = Vue;

// ══════════════════════════════════════════════════════
// LANGUAGE CONFIGURATION
// ══════════════════════════════════════════════════════
const LANG_CONFIGS = {
  python:     { id:"python",     label:"Python",     icon:"🐍", color:"#3572A5", pistonLang:"python",     version:"3.10.0",  ext:".py",    cm: () => python() },
  javascript: { id:"javascript", label:"JavaScript", icon:"⚡", color:"#f1e05a", pistonLang:"javascript", version:"18.15.0", ext:".js",    cm: () => javascript({jsx:true}) },
  typescript: { id:"typescript", label:"TypeScript", icon:"🔷", color:"#2b7489", pistonLang:"typescript", version:"5.0.3",  ext:".ts",    cm: () => javascript({typescript:true}) },
  cpp:        { id:"cpp",        label:"C++",        icon:"⚙️", color:"#f34b7d", pistonLang:"c++",        version:"10.2.0", ext:".cpp",   cm: () => cpp() },
  c:          { id:"c",          label:"C",          icon:"🔵", color:"#555555", pistonLang:"c",          version:"10.2.0", ext:".c",     cm: () => cpp() },
  java:       { id:"java",       label:"Java",       icon:"☕", color:"#b07219", pistonLang:"java",       version:"15.0.2", ext:".java",  cm: () => java() },
  rust:       { id:"rust",       label:"Rust",       icon:"🦀", color:"#dea584", pistonLang:"rust",       version:"1.50.0", ext:".rs",    cm: () => rust() },
  go:         { id:"go",         label:"Go",         icon:"🐹", color:"#00ADD8", pistonLang:"go",         version:"1.16.2", ext:".go",    cm: () => go() },
  php:        { id:"php",        label:"PHP",        icon:"🐘", color:"#4F5D95", pistonLang:"php",        version:"8.2.3",  ext:".php",   cm: () => php() },
  ruby:       { id:"ruby",       label:"Ruby",       icon:"💎", color:"#701516", pistonLang:"ruby",       version:"3.0.1",  ext:".rb",    cm: () => python() },
  swift:      { id:"swift",      label:"Swift",      icon:"🦅", color:"#F05138", pistonLang:"swift",      version:"5.3.3",  ext:".swift", cm: () => python() },
  kotlin:     { id:"kotlin",     label:"Kotlin",     icon:"🎯", color:"#A97BFF", pistonLang:"kotlin",     version:"1.8.20", ext:".kts",   cm: () => java() },
  csharp:     { id:"csharp",     label:"C#",         icon:"🎮", color:"#178600", pistonLang:"csharp",     version:"6.12.0", ext:".cs",    cm: () => java() },
  lua:        { id:"lua",        label:"Lua",        icon:"🌙", color:"#000080", pistonLang:"lua",        version:"5.4.2",  ext:".lua",   cm: () => python() },
  bash:       { id:"bash",       label:"Bash",       icon:"💻", color:"#89e051", pistonLang:"bash",       version:"5.2.0",  ext:".sh",    cm: () => python() },
  html:       { id:"html",       label:"HTML",       icon:"🌐", color:"#e34c26", pistonLang:"html",       version:"0.0.1",  ext:".html",  cm: () => html() },
  css:        { id:"css",        label:"CSS",        icon:"🎨", color:"#563d7c", pistonLang:"css",        version:"0.0.1",  ext:".css",   cm: () => css() },
  sql:        { id:"sql",        label:"SQL",        icon:"🗃️",  color:"#e38c00", pistonLang:"sqlite3",    version:"3.36.0", ext:".sql",   cm: () => sql() },
  markdown:   { id:"markdown",   label:"Markdown",   icon:"📝", color:"#083fa1", pistonLang:"markdown",   version:"0.0.1",  ext:".md",    cm: () => markdown() },

  // ── New Languages ──
  json:       { id:"json",       label:"JSON",       icon:"📋", color:"#f9c74f", pistonLang:"json",       version:"0.0.1",  ext:".json",  cm: () => json() },
  yaml:       { id:"yaml",       label:"YAML",       icon:"📄", color:"#cb171e", pistonLang:"yaml",       version:"0.0.1",  ext:".yaml",  cm: () => yaml() },
  dart:       { id:"dart",       label:"Dart",       icon:"🎯", color:"#00B4AB", pistonLang:"dart",       version:"2.19.6", ext:".dart",  cm: () => python() },
  r:          { id:"r",          label:"R",          icon:"📊", color:"#276DC3", pistonLang:"r",          version:"4.1.1",  ext:".r",     cm: () => python() },
  scala:      { id:"scala",      label:"Scala",      icon:"🔺", color:"#c22d40", pistonLang:"scala",      version:"3.2.2",  ext:".scala", cm: () => java() },
};

const LANG_GROUPS = [
  { label:"Popular",   langs:["python","javascript","typescript","cpp","java","rust","go"] },
  { label:"Web",       langs:["html","css","php","sql"] },
  { label:"Systems",   langs:["c","csharp","kotlin","swift","dart","scala"] },
  { label:"Scripting", langs:["ruby","lua","bash","r"] },
  { label:"Data",      langs:["json","yaml","sql","markdown"] },
].map(g => ({ label: g.label, langs: g.langs.map(id => LANG_CONFIGS[id]) }));

const PISTON_URL    = "https://emkc.org/api/v2/piston/execute";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const STORAGE_TREE   = "alone_v3_tree";
const STORAGE_ACTIVE = "alone_v3_active";
const STORAGE_PREFS  = "alone_v3_prefs";

// ── Code Templates ──
const TEMPLATES = {
  python:     `# ALONE CODE STUDIO v3 🚀\ndef greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nresult = greet("World")\nprint(result)\n\nfor i in range(1, 6):\n    print(f"  {i}. {'⭐' * i}")\n`,
  javascript: `// ALONE CODE STUDIO v3 🚀\nconst greet = (name) => \`Hello, \${name}!\`;\nconsole.log(greet("World"));\n\nconst nums = [1,2,3,4,5];\nconsole.log("Squares:", nums.map(n => n * n));\n`,
  typescript: `// ALONE CODE STUDIO v3 🚀\ninterface User { name: string; age: number; }\n\nfunction greet(user: User): string {\n  return \`Hello, \${user.name}! Age: \${user.age}\`;\n}\n\nconst u: User = { name: "World", age: 25 };\nconsole.log(greet(u));\n`,
  cpp:        `// ALONE CODE STUDIO v3 🚀\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    vector<int> v = {1,2,3,4,5};\n    for (int n : v) cout << n*n << " ";\n    cout << endl;\n    return 0;\n}\n`,
  java:       `// ALONE CODE STUDIO v3 🚀\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n        for (int i = 1; i <= 5; i++)\n            System.out.println(i + "^2 = " + (i*i));\n    }\n}\n`,
  rust:       `// ALONE CODE STUDIO v3 🚀\nfn main() {\n    println!("Hello, World!");\n    let squares: Vec<i32> = (1..=5).map(|n| n * n).collect();\n    println!("Squares: {:?}", squares);\n}\n`,
  go:         `// ALONE CODE STUDIO v3 🚀\npackage main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n    for i := 1; i <= 5; i++ {\n        fmt.Printf("%d^2 = %d\\n", i, i*i)\n    }\n}\n`,
  json:       `{\n  "project": "ALONE CODE STUDIO",\n  "version": "3.0",\n  "features": [\n    "Multi-language support",\n    "AI Assistant",\n    "Split View",\n    "Terminal"\n  ],\n  "languages": 24,\n  "author": "ALONE CODE"\n}\n`,
  yaml:       `# ALONE CODE STUDIO v3 Configuration\nproject:\n  name: "ALONE CODE STUDIO"\n  version: "3.0"\n  description: "Professional Web-based IDE"\n\nfeatures:\n  - multi_language: true\n  - ai_assistant: true\n  - split_view: true\n  - terminal: true\n\nlanguages:\n  count: 24\n  new:\n    - json\n    - yaml\n    - dart\n    - r\n    - scala\n`,
  dart:       `// ALONE CODE STUDIO v3 🚀\nvoid main() {\n  print('Hello, World!');\n\n  var squares = List.generate(5, (i) => (i + 1) * (i + 1));\n  print('Squares: \$squares');\n\n  for (var i = 1; i <= 5; i++) {\n    print('\$i^2 = \${i * i}');\n  }\n}\n`,
  r:          `# ALONE CODE STUDIO v3 🚀\ncat("Hello, World!\\n")\n\n# Compute squares\nsquares <- (1:5)^2\ncat("Squares:", squares, "\\n")\n\n# Simple statistics\nx <- c(10, 20, 30, 40, 50)\ncat("Mean:", mean(x), "\\n")\ncat("SD:  ", sd(x), "\\n")\n`,
  scala:      `// ALONE CODE STUDIO v3 🚀\nobject Main extends App {\n  println("Hello, World!")\n\n  val squares = (1 to 5).map(n => n * n)\n  println(s"Squares: \$squares")\n\n  for (i <- 1 to 5)\n    println(s"\$i^2 = \${i * i}")\n}\n`,
  default:    `// Start coding here...\n`,
};

function uid()            { return Math.random().toString(36).slice(2, 9); }
function getTemplate(lang){ return TEMPLATES[lang] || TEMPLATES.default; }

// ══════════════════════════════════════════════════════
// TREE-NODE COMPONENT
// ══════════════════════════════════════════════════════
const TreeNode = defineComponent({
  name: "TreeNode",
  props: {
    node:         { type: Object,  required: true },
    activeFileId: { type: String,  default: null  },
    splitFileId:  { type: String,  default: null  },
    depth:        { type: Number,  default: 0     },
  },
  emits: ["openFile","openSplit","rename","deleteNode","toggleFolder"],
  computed: {
    fileLangColor() {
      return (lang) => LANG_CONFIGS[lang]?.color || '#8b949e';
    }
  },
  methods: {
    onClick() {
      if (this.node.type === 'folder') this.$emit('toggleFolder', this.node.id);
      else this.$emit('openFile', this.node.id);
    },
    onCtx(e) {
      e.preventDefault();
      this.$emit('rename', this.node.id);
    },
    getColor(lang) { return LANG_CONFIGS[lang]?.color || '#8b949e'; }
  },
  template: `
    <div class="tree-node-wrap">
      <div class="tree-item"
        :class="{
          'tree-file':    node.type==='file',
          'tree-folder':  node.type==='folder',
          'active':       node.type==='file' && node.id===activeFileId,
          'split-active': node.type==='file' && node.id===splitFileId,
        }"
        :style="{'padding-left': (12 + depth*14) + 'px'}"
        @click="onClick"
        @contextmenu="onCtx">

        <span class="tree-chevron" v-if="node.type==='folder'">
          <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor"
            :style="{transform: node.open ? 'rotate(90deg)' : 'rotate(0deg)', transition:'transform 0.18s ease'}">
            <path d="M3 2l4 3-4 3V2z"/>
          </svg>
        </span>
        <span class="tree-icon" v-if="node.type==='folder'">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </span>
        <span v-else class="tree-file-dot" :style="{background: getColor(node.lang)}"></span>

        <span class="tree-name">{{ node.name }}</span>
        <span v-if="node.type==='file' && node.unsaved" class="tree-unsaved" title="Unsaved changes">●</span>

        <div class="tree-actions">
          <button v-if="node.type==='file'" class="tree-btn tree-btn-split"
            @click.stop="$emit('openSplit', node.id)" title="Open in split view">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="12" y1="3" x2="12" y2="21"/>
            </svg>
          </button>
          <button class="tree-btn tree-btn-rename"
            @click.stop="$emit('rename', node.id)" title="Rename">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="tree-btn tree-btn-del"
            @click.stop="$emit('deleteNode', node.id)" title="Delete">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
            </svg>
          </button>
        </div>
      </div>

      <template v-if="node.type==='folder' && node.open && node.children && node.children.length">
        <tree-node
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :active-file-id="activeFileId"
          :split-file-id="splitFileId"
          :depth="depth + 1"
          @open-file="$emit('openFile', $event)"
          @open-split="$emit('openSplit', $event)"
          @rename="$emit('rename', $event)"
          @delete-node="$emit('deleteNode', $event)"
          @toggle-folder="$emit('toggleFolder', $event)"
        />
      </template>
    </div>
  `,
});

// ══════════════════════════════════════════════════════
// MAIN VUE APP
// ══════════════════════════════════════════════════════
const app = createApp({
  components: { TreeNode },
  setup() {

    // ── Core State ──
    const loading        = ref(true);
    const sidebarOpen    = ref(window.innerWidth >= 768);
    const aiPanelOpen    = ref(false);
    const findOpen       = ref(false);
    const findQuery      = ref("");
    const replaceQuery   = ref("");
    const findInputRef   = ref(null);
    const settingsOpen   = ref(false);
    const showApiKey     = ref(false);
    const focusMode      = ref(false);
    const isMobile       = ref(window.innerWidth < 768);

    // ── File Tree ──
    const fileTree       = ref([]);
    const activeFileId   = ref(null);

    // ── Split View ──
    const splitView      = ref(false);
    const splitFileId    = ref(null);
    const splitPaneWidth = ref(420);

    // ── Editor State ──
    const outputLines    = ref([]);
    const isRunning      = ref(false);
    const consoleH       = ref(160);
    const consoleRef     = ref(null);
    const cursorLine     = ref(1);
    const cursorCol      = ref(1);
    const apiStatus      = ref("ok");
    const fontSize       = ref(13);
    const lineWrap       = ref(false);

    // ── Terminal ──
    const termInput      = ref("");
    const termInputRef   = ref(null);
    const termHistory    = ref([]);
    const termHistoryIdx = ref(-1);

    // ── AI ──
    const aiMessages     = ref([]);
    const aiPrompt       = ref("");
    const aiLoading      = ref(false);
    const aiIncludeCode  = ref(true);
    const aiChatRef      = ref(null);
    const aiPresets = [
      { label:"Explain",   prompt:"Explain what this code does step by step." },
      { label:"Find bugs", prompt:"Find any bugs or issues in this code and explain how to fix them." },
      { label:"Optimize",  prompt:"How can I optimize this code for better performance?" },
      { label:"Tests",     prompt:"Write comprehensive unit tests for this code." },
      { label:"Refactor",  prompt:"Refactor this code following best practices and modern patterns." },
      { label:"Document",  prompt:"Add thorough docstrings and inline comments to this code." },
    ];

    // ── Settings ──
    const settings = ref({
      theme:       "one-dark",
      font:        "jetbrains",
      tabSize:     2,
      apiKey:      "",
      projectName: "alone-code-studio",
    });

    const availableThemes = [
      { id:"one-dark",   label:"One Dark",    preview:"background:linear-gradient(135deg,#282c34,#1e2127)" },
      { id:"monokai",    label:"Monokai",     preview:"background:linear-gradient(135deg,#272822,#3e3d32)" },
      { id:"github-dark",label:"GitHub Dark", preview:"background:linear-gradient(135deg,#0d1117,#161b22)" },
      { id:"light",      label:"Light",       preview:"background:linear-gradient(135deg,#ffffff,#f6f8fa);border:1px solid #ccc" },
    ];

    const availableFonts = [
      { id:"jetbrains", label:"JetBrains Mono", family:"'JetBrains Mono', monospace" },
      { id:"fira",      label:"Fira Code",      family:"'Fira Code', monospace" },
      { id:"courier",   label:"Courier New",    family:"'Courier New', monospace" },
    ];

    // ── CodeMirror refs ──
    let editorView      = null;
    let splitEditorView = null;
    const langComp      = new Compartment();
    const wrapComp      = new Compartment();
    const fontComp      = new Compartment();
    const splitLangComp = new Compartment();
    const splitFontComp = new Compartment();
    let isInternalUpdate = false;

    // ══════════════════════════════════════
    // COMPUTED
    // ══════════════════════════════════════
    function flattenTree(nodes, acc = []) {
      if (!nodes) return acc;
      for (const n of nodes) {
        if (n.type === 'file') acc.push(n);
        else if (n.children) flattenTree(n.children, acc);
      }
      return acc;
    }

    const flatFiles = computed(() => flattenTree(fileTree.value));

    const activeFile = computed(() => flatFiles.value.find(f => f.id === activeFileId.value) || null);

    const splitFile = computed(() => flatFiles.value.find(f => f.id === splitFileId.value) || null);

    const currentLang = computed({
      get: () => activeFile.value?.lang ?? "python",
      set: val => { if (activeFile.value) activeFile.value.lang = val; },
    });

    const activeLangCfg = computed(() => LANG_CONFIGS[currentLang.value] || LANG_CONFIGS.python);
    const langGroups    = LANG_GROUPS;
    const modifiedCount = computed(() => flatFiles.value.filter(f => f.unsaved).length);

    const editorWrapHeight = computed(() => {
      const tabsH   = 34;
      const handleH = 30;
      const findH   = findOpen.value ? 38 : 0;
      return `calc(100% - ${tabsH + handleH + consoleH.value + findH}px)`;
    });

    function langCfg(lang) { return LANG_CONFIGS[lang] || null; }

    // ══════════════════════════════════════
    // TREE HELPERS
    // ══════════════════════════════════════
    function findNodeById(nodes, id) {
      if (!nodes) return null;
      for (const n of nodes) {
        if (n.id === id) return n;
        if (n.children) {
          const found = findNodeById(n.children, id);
          if (found) return found;
        }
      }
      return null;
    }

    function removeNodeById(nodes, id) {
      if (!nodes) return false;
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) { nodes.splice(i, 1); return true; }
        if (nodes[i].children && removeNodeById(nodes[i].children, id)) return true;
      }
      return false;
    }

    // ══════════════════════════════════════
    // PERSISTENCE
    // ══════════════════════════════════════
    function savePrefs() {
      try {
        localStorage.setItem(STORAGE_PREFS, JSON.stringify({
          fontSize: fontSize.value,
          lineWrap: lineWrap.value,
          consoleH: consoleH.value,
          settings: { ...settings.value },
        }));
      } catch(e) { /* storage full or disabled */ }
    }

    function loadPrefs() {
      try {
        const p = JSON.parse(localStorage.getItem(STORAGE_PREFS) || "{}");
        if (p.fontSize)              fontSize.value = p.fontSize;
        if (p.lineWrap !== undefined) lineWrap.value  = p.lineWrap;
        if (p.consoleH)              consoleH.value  = p.consoleH;
        if (p.settings)              Object.assign(settings.value, p.settings);
      } catch(e) {}
    }

    function saveFiles() {
      if (editorView && activeFile.value) {
        activeFile.value.code = editorView.state.doc.toString();
      }
      if (splitEditorView && splitFile.value) {
        splitFile.value.code = splitEditorView.state.doc.toString();
      }
      try {
        localStorage.setItem(STORAGE_TREE, JSON.stringify(fileTree.value));
        if (activeFileId.value) localStorage.setItem(STORAGE_ACTIVE, activeFileId.value);
      } catch(e) {}
    }

    // ══════════════════════════════════════
    // INIT FILES
    // ══════════════════════════════════════
    function initFiles() {
      loadPrefs();
      try {
        const raw = localStorage.getItem(STORAGE_TREE);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length) {
            fileTree.value = parsed;
            const savedActive = localStorage.getItem(STORAGE_ACTIVE);
            const allFiles    = flattenTree(parsed);
            const found       = allFiles.find(f => f.id === savedActive);
            activeFileId.value = found ? found.id : (allFiles[0]?.id || null);
            return;
          }
        }
      } catch(e) {}

      // Default project tree
      fileTree.value = [
        {
          id: uid(), type:'folder', name:'src', open:true,
          children: [
            { id:uid(), type:'file', name:"main.py",    lang:"python",     code:getTemplate("python"),     unsaved:false },
            { id:uid(), type:'file', name:"app.js",     lang:"javascript", code:getTemplate("javascript"), unsaved:false },
            { id:uid(), type:'file', name:"main.cpp",   lang:"cpp",        code:getTemplate("cpp"),        unsaved:false },
            { id:uid(), type:'file', name:"main.dart",  lang:"dart",       code:getTemplate("dart"),       unsaved:false },
          ],
        },
        {
          id: uid(), type:'folder', name:'backend', open:false,
          children: [
            { id:uid(), type:'file', name:"Main.java",  lang:"java",  code:getTemplate("java"),  unsaved:false },
            { id:uid(), type:'file', name:"main.rs",    lang:"rust",  code:getTemplate("rust"),  unsaved:false },
            { id:uid(), type:'file', name:"Main.scala", lang:"scala", code:getTemplate("scala"), unsaved:false },
          ],
        },
        {
          id: uid(), type:'folder', name:'data', open:false,
          children: [
            { id:uid(), type:'file', name:"data.json",   lang:"json", code:getTemplate("json"), unsaved:false },
            { id:uid(), type:'file', name:"config.yaml", lang:"yaml", code:getTemplate("yaml"), unsaved:false },
            { id:uid(), type:'file', name:"analysis.r",  lang:"r",    code:getTemplate("r"),    unsaved:false },
          ],
        },
        { id:uid(), type:'file', name:"main.go",    lang:"go",       code:getTemplate("go"),       unsaved:false },
        { id:uid(), type:'file', name:"README.md",  lang:"markdown", code:"# ALONE CODE STUDIO v3\n\nWelcome! Now with **JSON, YAML, Dart, R & Scala** support! 🚀\n", unsaved:false },
      ];
      activeFileId.value = flatFiles.value[0]?.id || null;
    }

    // ══════════════════════════════════════
    // THEME / FONT
    // ══════════════════════════════════════
    function applyTheme() {
      document.body.dataset.theme = settings.value.theme;
      savePrefs();
    }

    function applyFont() {
      const f = availableFonts.find(x => x.id === settings.value.font);
      if (f) document.documentElement.style.setProperty('--font-mono', f.family);
      savePrefs();
    }

    // ══════════════════════════════════════
    // CODEMIRROR
    // ══════════════════════════════════════
    function getLangExt(lang) {
      const cfg = LANG_CONFIGS[lang];
      if (!cfg?.cm) return python();
      try { return cfg.cm(); } catch { return python(); }
    }

    function buildExtensions(lang, wrap, fSize, isSplit = false) {
      const lc = isSplit ? splitLangComp : langComp;
      const wc = isSplit ? new Compartment() : wrapComp;
      const fc = isSplit ? splitFontComp   : fontComp;

      const baseExts = [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        drawSelection(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        rectangularSelection(),
        crosshairCursor(),
        autocompletion({ closeOnBlur: false }),
        search({ top: false }),
        foldGutter(),
        oneDark,
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        lc.of(getLangExt(lang)),
        wc.of(wrap ? EditorView.lineWrapping : []),
        fc.of(EditorView.theme({ "&": { fontSize: fSize + "px" } })),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          ...completionKeymap,
          indentWithTab,
          { key: "Ctrl-/", run: toggleComment },
          { key: "Cmd-/",  run: toggleComment },
        ]),
        EditorView.theme({
          "&":          { backgroundColor: "var(--bg2)", color: "var(--text)", height: "100%" },
          ".cm-scroller":{ fontFamily: "var(--font-mono)" },
        }),
      ];

      if (!isSplit) {
        baseExts.push(EditorView.updateListener.of(update => {
          if (update.docChanged && !isInternalUpdate && activeFile.value) {
            activeFile.value.code    = update.state.doc.toString();
            activeFile.value.unsaved = true;
          }
          const sel  = update.state.selection.main;
          const line = update.state.doc.lineAt(sel.head);
          cursorLine.value = line.number;
          cursorCol.value  = sel.head - line.from + 1;
        }));
      }

      return baseExts;
    }

    function initEditor() {
      const container = document.getElementById("cm-editor");
      if (!container || editorView) return;
      const file = activeFile.value;
      if (!file) return;

      editorView = new EditorView({
        state: EditorState.create({
          doc: file.code || "",
          extensions: buildExtensions(file.lang, lineWrap.value, fontSize.value),
        }),
        parent: container,
      });
    }

    function initSplitEditor(fileId) {
      nextTick(() => {
        const container = document.getElementById("cm-editor-split");
        if (!container) return;

        if (splitEditorView) { splitEditorView.destroy(); splitEditorView = null; }

        const file = flatFiles.value.find(f => f.id === fileId);
        if (!file) return;

        splitEditorView = new EditorView({
          state: EditorState.create({
            doc: file.code || "",
            extensions: buildExtensions(file.lang, lineWrap.value, fontSize.value, true),
          }),
          parent: container,
        });
      });
    }

    function updateEditorDoc(code, lang) {
      if (!editorView) return;
      isInternalUpdate = true;
      editorView.dispatch({
        changes: { from: 0, to: editorView.state.doc.length, insert: code || "" },
        effects: [ langComp.reconfigure(getLangExt(lang)) ],
      });
      editorView.scrollDOM.scrollTop = 0;
      isInternalUpdate = false;
    }

    // ══════════════════════════════════════
    // WATCHERS
    // ══════════════════════════════════════
    watch(fontSize, val => {
      const t = EditorView.theme({ "&": { fontSize: val + "px" } });
      if (editorView)      editorView.dispatch({ effects: fontComp.reconfigure(t) });
      if (splitEditorView) splitEditorView.dispatch({ effects: splitFontComp.reconfigure(t) });
      savePrefs();
    });

    watch(lineWrap, val => {
      if (editorView) editorView.dispatch({ effects: wrapComp.reconfigure(val ? EditorView.lineWrapping : []) });
      savePrefs();
    });

    // ══════════════════════════════════════
    // FILE OPERATIONS
    // ══════════════════════════════════════
    function switchFile(id) {
      if (!id) return;
      if (id === activeFileId.value) {
        if (isMobile.value) sidebarOpen.value = false;
        return;
      }
      if (editorView && activeFile.value) {
        activeFile.value.code = editorView.state.doc.toString();
      }
      activeFileId.value = id;
      saveFiles();
      nextTick(() => {
        const f = flatFiles.value.find(f => f.id === id);
        if (f) updateEditorDoc(f.code, f.lang);
        if (isMobile.value) sidebarOpen.value = false;
      });
    }

    function openSplit(id) {
      if (!id || id === activeFileId.value) return;
      if (splitEditorView && splitFile.value) {
        splitFile.value.code = splitEditorView.state.doc.toString();
      }
      splitFileId.value = id;
      splitView.value   = true;
      initSplitEditor(id);
    }

    function closeSplit() {
      if (splitEditorView) { splitEditorView.destroy(); splitEditorView = null; }
      splitFileId.value = null;
      splitView.value   = false;
    }

    function toggleSplitView() {
      if (splitView.value) {
        closeSplit();
      } else {
        const others = flatFiles.value.filter(f => f.id !== activeFileId.value);
        if (others.length) openSplit(others[0].id);
        else splitView.value = true;
      }
    }

    function createNewFile(lang = "python") {
      const cfg   = LANG_CONFIGS[lang] || LANG_CONFIGS.python;
      const count = flatFiles.value.filter(f => f.lang === lang).length + 1;
      const newFile = {
        id:      uid(),
        type:    'file',
        name:    `script${count}${cfg.ext}`,
        lang,
        code:    getTemplate(lang),
        unsaved: false,
      };
      fileTree.value.push(newFile);
      switchFile(newFile.id);
      saveFiles();
    }

    function createNewFolder() {
      const name = prompt("Folder name:", "new-folder");
      if (!name || !name.trim()) return;
      fileTree.value.push({ id: uid(), type:'folder', name: name.trim(), open:true, children:[] });
      saveFiles();
    }

    function toggleFolder(id) {
      const node = findNodeById(fileTree.value, id);
      if (node) { node.open = !node.open; saveFiles(); }
    }

    function startRename(id) {
      const node = findNodeById(fileTree.value, id);
      if (!node) return;
      const newName = prompt("Rename to:", node.name);
      if (!newName || !newName.trim() || newName.trim() === node.name) return;
      node.name = newName.trim();
      if (node.type === 'file') {
        const parts    = node.name.split('.');
        const ext      = parts.length > 1 ? '.' + parts.pop() : '';
        const matched  = Object.values(LANG_CONFIGS).find(l => l.ext === ext);
        if (matched) node.lang = matched.id;
      }
      saveFiles();
    }

    function deleteNode(id) {
      const node = findNodeById(fileTree.value, id);
      if (!node) return;
      const label = node.type === 'folder'
        ? `folder "${node.name}" and all its contents`
        : `"${node.name}"`;
      if (!confirm(`Delete ${label}?`)) return;

      const affectedIds = new Set(flattenTree([node]).map(f => f.id));
      affectedIds.add(id);

      if (affectedIds.has(activeFileId.value)) {
        const remaining = flatFiles.value.filter(f => !affectedIds.has(f.id));
        if (remaining.length) switchFile(remaining[0].id);
        else activeFileId.value = null;
      }
      if (splitFileId.value && affectedIds.has(splitFileId.value)) closeSplit();

      removeNodeById(fileTree.value, id);
      saveFiles();
    }

    function closeTab(id) { deleteNode(id); }

    function onLangChange() {
      const file = activeFile.value;
      if (!file) return;
      const cfg = LANG_CONFIGS[file.lang];
      if (!cfg) return;
      file.name = file.name.replace(/\.[^.]+$/, "") + cfg.ext;
      if (editorView) editorView.dispatch({ effects: langComp.reconfigure(getLangExt(file.lang)) });
      file.unsaved = true;
      saveFiles();
    }

    function toggleWrap() { lineWrap.value = !lineWrap.value; }

    function downloadFile() {
      const file = activeFile.value;
      if (!file) return;
      if (editorView) file.code = editorView.state.doc.toString();
      const blob = new Blob([file.code || ""], { type: "text/plain" });
      const a    = document.createElement("a");
      a.href     = URL.createObjectURL(blob);
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(a.href);
    }

    function toggleFocusMode() {
      focusMode.value = !focusMode.value;
      if (focusMode.value) { sidebarOpen.value = false; aiPanelOpen.value = false; }
    }

    // ══════════════════════════════════════
    // FIND & REPLACE
    // ══════════════════════════════════════
    function doFind() {
      if (!editorView || !findQuery.value) return;
      const doc = editorView.state.doc.toString();
      const from = editorView.state.selection.main.to;
      let   idx  = doc.indexOf(findQuery.value, from);
      if (idx === -1) idx = doc.indexOf(findQuery.value, 0);
      if (idx !== -1) {
        editorView.dispatch({
          selection:  { anchor: idx, head: idx + findQuery.value.length },
          scrollIntoView: true,
        });
        editorView.focus();
      }
    }

    function doReplace() {
      if (!editorView || !findQuery.value) return;
      const doc = editorView.state.doc.toString();
      const idx = doc.indexOf(findQuery.value);
      if (idx === -1) return;
      editorView.dispatch({
        changes:   { from: idx, to: idx + findQuery.value.length, insert: replaceQuery.value },
        selection: { anchor: idx + replaceQuery.value.length },
      });
    }

    // ══════════════════════════════════════
    // TERMINAL COMMANDS
    // ══════════════════════════════════════
    function execTermCmd() {
      const cmd = termInput.value.trim();
      if (!cmd) return;

      termHistory.value.unshift(cmd);
      termHistoryIdx.value = -1;
      termInput.value = "";

      addOutput(cmd, 'cmd');

      const parts = cmd.split(/\s+/);
      const base  = parts[0].toLowerCase();

      if (base === 'echo') {
        addOutput(parts.slice(1).join(' '), 'text-line');
      } else if (base === 'run') {
        runCode();
      } else if (base === 'clear' || base === 'cls') {
        outputLines.value = [];
      } else if (base === 'ls' || base === 'dir') {
        const names = flatFiles.value.map(f => f.name).join('  ');
        addOutput(names || '(no files)', 'text-line');
      } else if (base === 'pwd') {
        addOutput(`/workspace/${settings.value.projectName || 'alone-code-studio'}`, 'text-line');
      } else if (base === 'version' || base === '--version') {
        addOutput('ALONE CODE STUDIO v3.0  |  Vue 3 + CodeMirror 6  |  24 languages', 'text-line');
      } else if (base === 'date') {
        addOutput(new Date().toString(), 'text-line');
      } else if (base === 'langs') {
        addOutput(Object.keys(LANG_CONFIGS).join('  '), 'text-line');
      } else if (base === 'help') {
        addOutput('Commands: help  clear  ls  pwd  version  date  langs  echo [text]  run', 'info');
      } else {
        addOutput(`bash: ${base}: command not found  (type "help" for commands)`, 'error');
      }

      nextTick(() => {
        if (termInputRef.value) termInputRef.value.focus();
      });
    }

    function termHistoryUp() {
      if (termHistoryIdx.value < termHistory.value.length - 1) {
        termHistoryIdx.value++;
        termInput.value = termHistory.value[termHistoryIdx.value];
      }
    }

    function termHistoryDown() {
      if (termHistoryIdx.value > 0) {
        termHistoryIdx.value--;
        termInput.value = termHistory.value[termHistoryIdx.value];
      } else {
        termHistoryIdx.value = -1;
        termInput.value = "";
      }
    }

    // ══════════════════════════════════════
    // RUN CODE
    // ══════════════════════════════════════
    async function runCode() {
      if (isRunning.value) return;

      if (editorView && activeFile.value) {
        activeFile.value.code = editorView.state.doc.toString();
      }
      saveFiles();

      const file = activeFile.value;
      if (!file) return;
      const code = (file.code || "").trim();
      if (!code) { addOutput("No code to execute.", "info"); return; }

      isRunning.value    = true;
      outputLines.value  = [];
      apiStatus.value    = "loading";

      const cfg = LANG_CONFIGS[file.lang] || LANG_CONFIGS.python;
      const ts  = new Date().toLocaleTimeString();
      addOutput(`[${ts}] Running ${file.name} (${cfg.pistonLang} ${cfg.version})`, "cmd");

      // JSON/YAML/Markdown: preview locally, no API needed
      if (["json", "yaml", "markdown", "css", "html"].includes(file.lang)) {
        try {
          if (file.lang === "json") {
            const parsed = JSON.parse(code);
            addOutput(JSON.stringify(parsed, null, 2), "text-line");
          } else {
            addOutput(code, "text-line");
          }
          addOutput(`Process exited with code 0`, "success");
        } catch(e) {
          addOutput(e.message, "error");
          addOutput(`Process exited with code 1`, "error");
        }
        isRunning.value = false;
        apiStatus.value = "ok";
        return;
      }

      try {
        const res = await fetch(PISTON_URL, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: cfg.pistonLang,
            version:  cfg.version,
            files:    [{ name: file.name, content: code }],
            stdin:    "",
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

        const data = await res.json();
        apiStatus.value = "ok";

        if (data.compile?.output) {
          data.compile.output.split("\n").forEach(l => l && addOutput(l, "error"));
        }

        const run = data.run;
        if (run?.stdout) {
          run.stdout.split("\n").forEach(l => addOutput(l, "text-line"));
        }
        if (run?.stderr) {
          addOutput("── stderr ──", "error");
          run.stderr.split("\n").forEach(l => l && addOutput(l, "error"));
        }

        const exitCode = run?.code ?? 0;
        if (exitCode === 0 && !run?.stderr) {
          addOutput(`Process exited with code 0`, "success");
        } else {
          addOutput(`Process exited with code ${exitCode}`, exitCode !== 0 ? "error" : "success");
        }

      } catch (err) {
        apiStatus.value = "error";
        addOutput("── Connection Error ──", "error");
        addOutput(err.message, "error");
        addOutput("Check your internet connection.", "info");
      } finally {
        isRunning.value = false;
      }
    }

    function addOutput(text, type = "text-line") {
      outputLines.value.push({ text: String(text), type });
      nextTick(() => {
        if (consoleRef.value) consoleRef.value.scrollTop = consoleRef.value.scrollHeight;
      });
    }

    function clearOutput() { outputLines.value = []; }

    function copyOutput() {
      const text = outputLines.value.map(l => l.text).join("\n");
      navigator.clipboard.writeText(text).catch(() => {});
    }

    function highlightOutput(text) {
      return String(text)
        .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
        .replace(/(\d+\.\d+|\d+)/g, '<span class="hl-num">$1</span>')
        .replace(/"([^"]+)"/g, '"<span class="hl-str">$1</span>"')
        .replace(/\b(True|False|None|null|undefined|true|false)\b/g, '<span class="hl-kw">$1</span>');
    }

    // ══════════════════════════════════════
    // AI ASSISTANT
    // ══════════════════════════════════════
    async function sendAiMessage() {
      const prompt = aiPrompt.value.trim();
      if (!prompt || aiLoading.value) return;

      if (editorView && activeFile.value) {
        activeFile.value.code = editorView.state.doc.toString();
      }

      let contextBlock = "";
      if (aiIncludeCode.value && flatFiles.value.length) {
        contextBlock = "\n\n---\n**PROJECT FILES:**\n\n" + flatFiles.value.map(f =>
          `**${f.name}** (${f.lang}):\n\`\`\`${f.lang}\n${f.code || ''}\n\`\`\``
        ).join("\n\n");
      }

      aiMessages.value.push({ role: "user", content: prompt });
      aiPrompt.value  = "";
      aiLoading.value = true;

      nextTick(() => {
        if (aiChatRef.value) aiChatRef.value.scrollTop = aiChatRef.value.scrollHeight;
      });

      try {
        const apiMessages = aiMessages.value.map((m, i) => {
          if (i === aiMessages.value.length - 1 && m.role === 'user') {
            return { role: 'user', content: m.content + contextBlock };
          }
          return { role: m.role, content: m.content };
        });

        const headers = { "Content-Type": "application/json" };
        if (settings.value.apiKey) headers["x-api-key"] = settings.value.apiKey;

        const res = await fetch(ANTHROPIC_URL, {
          method:  "POST",
          headers,
          body: JSON.stringify({
            model:      "claude-sonnet-4-20250514",
            max_tokens: 2048,
            system: `You are an expert programming assistant inside ALONE CODE STUDIO v3, a professional web-based IDE supporting 24 languages including JSON, YAML, Dart, R, and Scala. Be helpful and concise. Format all code with proper markdown code blocks. The user currently has ${flatFiles.value.length} file(s) open: ${flatFiles.value.map(f => f.name).join(', ')}.`,
            messages: apiMessages,
          }),
        });

        const data  = await res.json();
        const reply = data.content?.find(b => b.type === "text")?.text
          || data.error?.message
          || "Sorry, I couldn't respond. Check your API key in Settings.";

        aiMessages.value.push({ role: "assistant", content: reply });

      } catch (err) {
        aiMessages.value.push({
          role:    "assistant",
          content: `⚠️ **Connection error:** ${err.message}\n\nMake sure you're online. If using a custom API key, verify it in ⚙️ Settings.`,
        });
      } finally {
        aiLoading.value = false;
        nextTick(() => {
          if (aiChatRef.value) aiChatRef.value.scrollTop = aiChatRef.value.scrollHeight;
        });
      }
    }

    function clearAiChat() { aiMessages.value = []; }

    function formatAiMsg(content) {
      return String(content)
        .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
        .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
          `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`)
        .replace(/`([^`\n]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*\n]+)\*/g,   "<em>$1</em>")
        .replace(/\n/g, "<br>");
    }

    // ══════════════════════════════════════
    // CONSOLE RESIZE
    // ══════════════════════════════════════
    let resizing = false, resY = 0, resH = 0;

    function startResize(e) {
      resizing = true; resY = e.clientY; resH = consoleH.value;
      document.addEventListener("mousemove", doResize);
      document.addEventListener("mouseup",   stopResize);
    }
    function startResizeTouch(e) {
      resizing = true; resY = e.touches[0].clientY; resH = consoleH.value;
      document.addEventListener("touchmove", doResizeTouch, { passive: false });
      document.addEventListener("touchend",  stopResize);
    }
    function doResize(e) {
      if (!resizing) return;
      consoleH.value = Math.max(50, Math.min(500, resH + (resY - e.clientY)));
    }
    function doResizeTouch(e) {
      e.preventDefault();
      if (!resizing) return;
      consoleH.value = Math.max(50, Math.min(500, resH + (resY - e.touches[0].clientY)));
    }
    function stopResize() {
      resizing = false;
      document.removeEventListener("mousemove", doResize);
      document.removeEventListener("mouseup",   stopResize);
      document.removeEventListener("touchmove", doResizeTouch);
      document.removeEventListener("touchend",  stopResize);
      savePrefs();
    }

    // ══════════════════════════════════════
    // SPLIT PANE RESIZE
    // ══════════════════════════════════════
    let splitResizing = false, splitResX = 0, splitResW = 0;

    function startSplitResize(e) {
      splitResizing = true; splitResX = e.clientX; splitResW = splitPaneWidth.value;
      document.addEventListener("mousemove", doSplitResize);
      document.addEventListener("mouseup",   stopSplitResize);
    }
    function startSplitResizeTouch(e) {
      splitResizing = true; splitResX = e.touches[0].clientX; splitResW = splitPaneWidth.value;
      document.addEventListener("touchmove", doSplitResizeTouch, { passive: false });
      document.addEventListener("touchend",  stopSplitResize);
    }
    function doSplitResize(e) {
      if (!splitResizing) return;
      const maxW = window.innerWidth - 300;
      splitPaneWidth.value = Math.max(180, Math.min(maxW, splitResW - (e.clientX - splitResX)));
    }
    function doSplitResizeTouch(e) {
      e.preventDefault();
      if (!splitResizing) return;
      const maxW = window.innerWidth - 300;
      splitPaneWidth.value = Math.max(180, Math.min(maxW, splitResW - (e.touches[0].clientX - splitResX)));
    }
    function stopSplitResize() {
      splitResizing = false;
      document.removeEventListener("mousemove", doSplitResize);
      document.removeEventListener("mouseup",   stopSplitResize);
      document.removeEventListener("touchmove", doSplitResizeTouch);
      document.removeEventListener("touchend",  stopSplitResize);
    }

    // ══════════════════════════════════════
    // KEYBOARD SHORTCUTS
    // ══════════════════════════════════════
    document.addEventListener("keydown", e => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "Enter") { e.preventDefault(); runCode(); }
      if (ctrl && e.key === "s")     { e.preventDefault(); saveFiles(); if (activeFile.value) activeFile.value.unsaved = false; }
      if (ctrl && e.key === "f")     { e.preventDefault(); findOpen.value = !findOpen.value; nextTick(() => findInputRef.value?.focus()); }
      if (ctrl && e.key === "b")     { e.preventDefault(); sidebarOpen.value = !sidebarOpen.value; }
      if (ctrl && e.key === "\\")    { e.preventDefault(); toggleSplitView(); }
      if (e.key === "Escape")        { findOpen.value = false; settingsOpen.value = false; }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) saveFiles();
    });

    window.addEventListener("resize", () => {
      isMobile.value = window.innerWidth < 768;
    });

    // ══════════════════════════════════════
    // LIFECYCLE
    // ══════════════════════════════════════
    onMounted(async () => {
      initFiles();
      applyTheme();
      applyFont();
      await new Promise(r => setTimeout(r, 1400));
      loading.value = false;
      await nextTick();
      initEditor();
    });

    // ══════════════════════════════════════
    // EXPOSE TO TEMPLATE
    // ══════════════════════════════════════
    return {
      loading, sidebarOpen, aiPanelOpen, findOpen, findQuery, replaceQuery,
      findInputRef, settingsOpen, showApiKey, focusMode, isMobile,
      splitView, splitFileId, splitPaneWidth,
      fileTree, flatFiles, activeFileId, activeFile, splitFile,
      currentLang, activeLangCfg, langGroups, langCfg,
      outputLines, isRunning, consoleH, consoleRef, cursorLine, cursorCol,
      apiStatus, fontSize, lineWrap, modifiedCount, editorWrapHeight,
      termInput, termInputRef,
      aiMessages, aiPrompt, aiLoading, aiIncludeCode, aiChatRef, aiPresets,
      settings, availableThemes, availableFonts,
      savePrefs, applyTheme, applyFont,
      switchFile, openSplit, closeSplit, toggleSplitView,
      createNewFile, createNewFolder, toggleFolder, startRename,
      deleteNode, closeTab,
      onLangChange, toggleWrap, downloadFile, toggleFocusMode,
      runCode, clearOutput, copyOutput, highlightOutput,
      startResize, startResizeTouch,
      startSplitResize, startSplitResizeTouch,
      sendAiMessage, clearAiChat, formatAiMsg,
      doFind, doReplace,
      execTermCmd, termHistoryUp, termHistoryDown,
    };
  },
});

app.component('TreeNode', TreeNode);
app.mount("#app");
