'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Heading from '@tiptap/extension-heading';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Code,
  Minus,
  Table as TableIcon,
  Plus,
  Trash2,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { useCallback, useRef, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import AIImageGenerator from './AIImageGenerator';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Extended Image extension with width and alignment
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width') || element.style.width?.replace('px', '') || null,
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return { width: attributes.width, style: `width: ${attributes.width}` };
        },
      },
      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-align') || 'center',
        renderHTML: attributes => {
          return { 'data-align': attributes.align };
        },
      },
    };
  },
});

export default function TipTapEditor({ content, onChange, placeholder }: TipTapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
    width: string;
    align: string;
  } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      ResizableImage.configure({
        HTMLAttributes: {
          class: 'rounded-lg',
        },
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing your blog post...',
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2 bg-gray-100 font-semibold',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
  });

  // Check if image is selected
  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      const { state } = editor;
      const { selection } = state;
      const node = selection.$anchor.parent;

      // Check if we're in an image node
      if (selection.$anchor.nodeBefore?.type.name === 'image') {
        const imgNode = selection.$anchor.nodeBefore;
        setSelectedImage({
          src: imgNode.attrs.src,
          alt: imgNode.attrs.alt || '',
          width: imgNode.attrs.width || 'auto',
          align: imgNode.attrs.align || 'center',
        });
      } else {
        setSelectedImage(null);
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;

    try {
      const response = await api.uploadBlogImage(file);
      editor.chain().focus().setImage({ src: response.url, alt: response.alt_text }).run();
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    }
  }, [editor]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    e.target.value = '';
  }, [handleImageUpload]);

  const addLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const insertTable = useCallback((rows: number, cols: number) => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setShowTableMenu(false);
  }, [editor]);

  const handleAIImageGenerated = useCallback((imageUrl: string) => {
    if (!editor) return;
    editor.chain().focus().setImage({
      src: imageUrl,
      alt: 'AI Generated Image',
    }).run();
    setShowAIGenerator(false);
  }, [editor]);

  const updateImageAttribute = useCallback((attr: string, value: string) => {
    if (!editor) return;
    editor.chain().focus().updateAttributes('image', { [attr]: value }).run();
    setSelectedImage(prev => prev ? { ...prev, [attr]: value } : null);
  }, [editor]);

  if (!editor) {
    return <div className="animate-pulse h-96 bg-gray-100 rounded-lg" />;
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    children,
    title,
    className = '',
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
    className?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        isActive ? 'bg-gray-100 text-blue-600' : 'text-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );

  const isInTable = editor.isActive('table');

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Main Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        {/* Text Style */}
        <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive('paragraph')}
            title="Paragraph"
          >
            <Pilcrow className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Formatting */}
        <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Insert */}
        <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
          <ToolbarButton onClick={addLink} isActive={editor.isActive('link')} title="Insert Link">
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => fileInputRef.current?.click()}
            title="Upload Image"
          >
            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setShowAIGenerator(true)}
            title="AI Generate Image"
            className="text-purple-600 hover:text-purple-700"
          >
            <Sparkles className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <Minus className="w-4 h-4" />
          </ToolbarButton>

          {/* Table Dropdown */}
          <div className="relative">
            <ToolbarButton
              onClick={() => setShowTableMenu(!showTableMenu)}
              isActive={isInTable}
              title="Insert Table"
            >
              <TableIcon className="w-4 h-4" />
            </ToolbarButton>

            {showTableMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 w-48">
                <p className="text-xs text-gray-500 mb-2 font-medium">Insert Table</p>
                <div className="grid grid-cols-3 gap-1">
                  {[2, 3, 4].map(rows => (
                    [2, 3, 4].map(cols => (
                      <button
                        key={`${rows}-${cols}`}
                        onClick={() => insertTable(rows, cols)}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded transition-colors"
                      >
                        {rows}x{cols}
                      </button>
                    ))
                  ))}
                </div>
                <button
                  onClick={() => setShowTableMenu(false)}
                  className="mt-2 w-full text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table Controls (shown when in table) */}
        {isInTable && (
          <div className="flex items-center border-r border-gray-200 pr-2 mr-2 bg-blue-50 rounded px-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().addRowAfter().run()}
              title="Add Row"
            >
              <Plus className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              title="Add Column"
            >
              <Plus className="w-4 h-4 rotate-90" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().deleteRow().run()}
              title="Delete Row"
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().deleteColumn().run()}
              title="Delete Column"
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4 rotate-90" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().deleteTable().run()}
              title="Delete Table"
              className="text-red-600 hover:text-red-700"
            >
              <TableIcon className="w-4 h-4" />
            </ToolbarButton>
          </div>
        )}

        {/* Undo/Redo */}
        <div className="flex items-center">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Image Controls (shown when image is selected) */}
      {selectedImage && (
        <div className="flex flex-wrap items-center gap-4 p-2 border-b border-gray-200 bg-blue-50">
          <span className="text-sm font-medium text-gray-700">Image:</span>

          {/* Width Control */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Width:</label>
            <select
              value={selectedImage.width === 'auto' ? '' : selectedImage.width}
              onChange={(e) => updateImageAttribute('width', e.target.value || 'auto')}
              className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
            >
              <option value="">Auto</option>
              <option value="25%">25%</option>
              <option value="50%">50%</option>
              <option value="75%">75%</option>
              <option value="100%">100%</option>
              <option value="300px">300px</option>
              <option value="500px">500px</option>
            </select>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-500 mr-1">Align:</label>
            <button
              onClick={() => updateImageAttribute('align', 'left')}
              className={`p-1.5 rounded ${selectedImage.align === 'left' ? 'bg-blue-200 text-blue-700' : 'hover:bg-gray-200'}`}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateImageAttribute('align', 'center')}
              className={`p-1.5 rounded ${selectedImage.align === 'center' ? 'bg-blue-200 text-blue-700' : 'hover:bg-gray-200'}`}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateImageAttribute('align', 'right')}
              className={`p-1.5 rounded ${selectedImage.align === 'right' ? 'bg-blue-200 text-blue-700' : 'hover:bg-gray-200'}`}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* Alt Text */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <label className="text-xs text-gray-500">Alt:</label>
            <input
              type="text"
              value={selectedImage.alt}
              onChange={(e) => updateImageAttribute('alt', e.target.value)}
              placeholder="Image description"
              className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 bg-white"
            />
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Bubble Menu */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="bg-white rounded-lg shadow-lg border border-gray-200 flex items-center p-1"
        >
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={addLink} isActive={editor.isActive('link')} title="Link">
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
        </BubbleMenu>
      )}

      {/* AI Image Generator Modal */}
      {showAIGenerator && (
        <AIImageGenerator
          onClose={() => setShowAIGenerator(false)}
          onImageGenerated={handleAIImageGenerated}
          currentContent={content}
        />
      )}
    </div>
  );
}
