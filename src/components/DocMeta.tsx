import { cn } from "@/lib/utils";
import { contentsOf, type Doc } from "../sets";
import { metaName, metaRow, metaVal, mono } from "../ui";

/* The four facts every document carries, whichever kind it is. Only the
   Contents line differs, and it differs as data — see contentsOf. */
export default function DocMeta({ doc }: { doc: Doc }) {
  return (
    <div className="mt-8 border-t border-border">
      <div className={metaRow}>
        <span className={metaName}>Reference file</span>
        <span className="flex-1" />
        <span className={cn(metaVal, mono)}>{doc.file}</span>
      </div>
      <div className={metaRow}>
        <span className={metaName}>Contents</span>
        <span className="flex-1" />
        <span className={metaVal}>{contentsOf(doc)}</span>
      </div>
      <div className={metaRow}>
        <span className={metaName}>Theme</span>
        <span className="flex-1" />
        <span className={metaVal}>{doc.theme}</span>
      </div>
      <div className={metaRow}>
        <span className={metaName}>Added</span>
        <span className="flex-1" />
        <span className={metaVal}>{doc.addedLabel}</span>
      </div>
    </div>
  );
}
