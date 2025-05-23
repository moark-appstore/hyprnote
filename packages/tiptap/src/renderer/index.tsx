import "../styles/tiptap.css";

import { type Editor as TiptapEditor, EditorContent, type HTMLContent, useEditor } from "@tiptap/react";
import { forwardRef, useEffect } from "react";
import * as shared from "../shared";

interface RendererProps {
  initialContent: HTMLContent;
}

const Renderer = forwardRef<{ editor: TiptapEditor | null }, RendererProps>(
  ({ initialContent }, ref) => {
    const editor = useEditor({
      extensions: shared.extensions,
      editable: false,
      shouldRerenderOnTransaction: false,
      editorProps: {
        attributes: {
          class: "tiptap-normal",
        },
        scrollThreshold: 32,
        scrollMargin: 32,
      },
    });

    useEffect(() => {
      if (ref && typeof ref === "object") {
        ref.current = { editor };
      }
    }, [editor]);

    useEffect(() => {
      if (editor) {
        editor.commands.setContent(initialContent);
      }
    }, [editor, initialContent]);

    return (
      <div role="textbox">
        <EditorContent editor={editor} />
      </div>
    );
  },
);

Renderer.displayName = "Renderer";

export default Renderer;
