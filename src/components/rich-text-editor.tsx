import { useRef, useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Film,
  Table as TableIcon,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2,
  Loader2,
  Eraser,
  Baseline,
  Highlighter,
  ChevronDown,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
};

const BLOCKS = [
  { tag: "p", label: "Paragraph" },
  { tag: "h1", label: "Heading 1" },
  { tag: "h2", label: "Heading 2" },
  { tag: "h3", label: "Heading 3" },
  { tag: "h4", label: "Heading 4" },
  { tag: "pre", label: "Code block" },
];

/** Convert a YouTube / Vimeo / direct URL into embeddable HTML. */
function embedFromUrl(url: string): string {
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt) {
    return `<div class="embed-video"><iframe src="https://www.youtube.com/embed/${yt[1]}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  }
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return `<div class="embed-video"><iframe src="https://player.vimeo.com/video/${vimeo[1]}" title="Vimeo video" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
  }
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
    return `<video src="${url}" controls playsinline></video>`;
  }
  // Fallback: generic iframe embed
  return `<div class="embed-video"><iframe src="${url}" title="Embedded content" frameborder="0" allowfullscreen></iframe></div>`;
}

export function RichTextEditor({ value, onChange, onImageUpload }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [uploading, setUploading] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);

  // Seed content once on mount so the caret position is never reset on re-render.
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = () => onChange(ref.current?.innerHTML ?? "");

  const saveSel = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && ref.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSel = () => {
    ref.current?.focus();
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    emit();
  };

  const formatBlock = (tag: string) => {
    ref.current?.focus();
    document.execCommand("formatBlock", false, tag.toUpperCase());
    emit();
    setBlockOpen(false);
  };

  const insertHTML = (html: string) => {
    restoreSel();
    document.execCommand("insertHTML", false, html);
    emit();
  };

  const addLink = () => {
    saveSel();
    const url = window.prompt("Link URL (https://…)");
    restoreSel();
    if (!url) return;
    exec("createLink", url);
  };

  const addImageUrl = () => {
    saveSel();
    const url = window.prompt("Image URL (https://…)");
    if (!url) return;
    insertHTML(`<img src="${url}" alt="" />`);
  };

  const addVideo = () => {
    saveSel();
    const url = window.prompt("Video or embed URL (YouTube, Vimeo, or .mp4)");
    if (!url) return;
    insertHTML(embedFromUrl(url.trim()) + "<p><br/></p>");
  };

  const addTable = () => {
    saveSel();
    const cols = Number(window.prompt("Number of columns?", "3")) || 0;
    const rows = Number(window.prompt("Number of rows?", "3")) || 0;
    if (cols < 1 || rows < 1) return;
    let html = "<table><thead><tr>";
    for (let c = 0; c < cols; c++) html += `<th>Heading ${c + 1}</th>`;
    html += "</tr></thead><tbody>";
    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) html += "<td>Cell</td>";
      html += "</tr>";
    }
    html += "</tbody></table><p><br/></p>";
    insertHTML(html);
  };

  const pickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onImageUpload) return;
    setUploading(true);
    try {
      const url = await onImageUpload(file);
      insertHTML(`<img src="${url}" alt="" />`);
    } finally {
      setUploading(false);
    }
  };

  const Btn = ({
    onClick,
    title,
    children,
  }: {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {children}
    </button>
  );

  const ColorBtn = ({
    cmd,
    title,
    icon,
  }: {
    cmd: "foreColor" | "hiliteColor";
    title: string;
    icon: React.ReactNode;
  }) => (
    <label
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        saveSel();
      }}
      className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {icon}
      <input
        type="color"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        onChange={(e) => {
          restoreSel();
          document.execCommand(cmd, false, e.target.value);
          emit();
        }}
      />
    </label>
  );

  const Divider = () => <span className="mx-1 h-6 w-px bg-border" />;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-border bg-background/80 px-2 py-1.5 backdrop-blur">
        {/* Block format dropdown */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setBlockOpen((o) => !o)}
            className="inline-flex h-9 items-center gap-1 rounded-2xl px-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Format <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {blockOpen && (
            <div className="absolute left-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lg">
              {BLOCKS.map((b) => (
                <button
                  key={b.tag}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => formatBlock(b.tag)}
                  className="block w-full rounded-2xl px-3 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-secondary"
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <Divider />
        <Btn title="Bold" onClick={() => exec("bold")}>
          <Bold className="h-4 w-4" />
        </Btn>
        <Btn title="Italic" onClick={() => exec("italic")}>
          <Italic className="h-4 w-4" />
        </Btn>
        <Btn title="Underline" onClick={() => exec("underline")}>
          <Underline className="h-4 w-4" />
        </Btn>
        <Btn title="Strikethrough" onClick={() => exec("strikeThrough")}>
          <Strikethrough className="h-4 w-4" />
        </Btn>
        <ColorBtn cmd="foreColor" title="Text color" icon={<Baseline className="h-4 w-4" />} />
        <ColorBtn cmd="hiliteColor" title="Highlight" icon={<Highlighter className="h-4 w-4" />} />
        <Divider />
        <Btn title="Align left" onClick={() => exec("justifyLeft")}>
          <AlignLeft className="h-4 w-4" />
        </Btn>
        <Btn title="Align center" onClick={() => exec("justifyCenter")}>
          <AlignCenter className="h-4 w-4" />
        </Btn>
        <Btn title="Align right" onClick={() => exec("justifyRight")}>
          <AlignRight className="h-4 w-4" />
        </Btn>
        <Btn title="Justify" onClick={() => exec("justifyFull")}>
          <AlignJustify className="h-4 w-4" />
        </Btn>
        <Divider />
        <Btn title="Bullet list" onClick={() => exec("insertUnorderedList")}>
          <List className="h-4 w-4" />
        </Btn>
        <Btn title="Numbered list" onClick={() => exec("insertOrderedList")}>
          <ListOrdered className="h-4 w-4" />
        </Btn>
        <Btn title="Quote" onClick={() => formatBlock("blockquote")}>
          <Quote className="h-4 w-4" />
        </Btn>
        <Btn title="Code block" onClick={() => formatBlock("pre")}>
          <Code2 className="h-4 w-4" />
        </Btn>
        <Btn title="Horizontal line" onClick={() => exec("insertHorizontalRule")}>
          <Minus className="h-4 w-4" />
        </Btn>
        <Divider />
        <Btn title="Add link" onClick={addLink}>
          <LinkIcon className="h-4 w-4" />
        </Btn>
        <Btn title="Remove link" onClick={() => exec("unlink")}>
          <Unlink className="h-4 w-4" />
        </Btn>
        {onImageUpload && (
          <Btn title="Upload image" onClick={() => fileRef.current?.click()}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
          </Btn>
        )}
        <Btn title="Image by URL" onClick={addImageUrl}>
          <ImageIcon className="h-4 w-4 opacity-70" />
        </Btn>
        <Btn title="Insert video / embed" onClick={addVideo}>
          <Film className="h-4 w-4" />
        </Btn>
        <Btn title="Insert table" onClick={addTable}>
          <TableIcon className="h-4 w-4" />
        </Btn>
        <Divider />
        <Btn title="Clear formatting" onClick={() => exec("removeFormat")}>
          <Eraser className="h-4 w-4" />
        </Btn>
        <Btn title="Undo" onClick={() => exec("undo")}>
          <Undo2 className="h-4 w-4" />
        </Btn>
        <Btn title="Redo" onClick={() => exec("redo")}>
          <Redo2 className="h-4 w-4" />
        </Btn>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickImage} />
      </div>

      <div
        ref={ref}
        contentEditable
        onInput={emit}
        onBlur={emit}
        onKeyUp={saveSel}
        onMouseUp={saveSel}
        data-placeholder="Write your article…"
        className="article-editor min-h-[420px] max-w-none px-5 py-4 text-[0.975rem] leading-relaxed text-foreground outline-none"
      />
    </div>
  );
}
