import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Link as LinkIcon, List, ListOrdered } from 'lucide-react';
import { cn } from '../lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

/**
 * Editor de texto enriquecido (sección 3): el HTML que produce aquí se
 * sanea de nuevo en el servidor con DOMPurify antes de guardarse (nunca se
 * confía en el HTML que llega del navegador, ni siquiera de un admin
 * autenticado — ver apps/api/src/lib/sanitizeHtml.ts).
 */
export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const buttons = [
    {
      label: 'Negrita',
      icon: Bold,
      active: editor.isActive('bold'),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: 'Cursiva',
      icon: Italic,
      active: editor.isActive('italic'),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: 'Lista',
      icon: List,
      active: editor.isActive('bulletList'),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: 'Lista numerada',
      icon: ListOrdered,
      active: editor.isActive('orderedList'),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: 'Enlace',
      icon: LinkIcon,
      active: editor.isActive('link'),
      onClick: () => {
        const url = window.prompt('URL del enlace');
        if (url) editor.chain().focus().setLink({ href: url }).run();
      },
    },
  ];

  return (
    <div className="rounded-md border border-line">
      <div className="flex gap-1 border-b border-line p-2">
        {buttons.map(({ label, icon: Icon, active, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            aria-label={label}
            aria-pressed={active}
            className={cn(
              'rounded p-1.5 text-muted hover:bg-elevated hover:text-ink',
              active && 'bg-elevated text-primary',
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} className="prose prose-sm max-w-none px-3 py-2 focus:outline-none" />
    </div>
  );
}
