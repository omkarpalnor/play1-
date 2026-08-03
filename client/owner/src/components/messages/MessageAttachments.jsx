import { Download, FileText, Image as ImageIcon } from "lucide-react";
import {
  formatAttachmentSize,
  isImageAttachment,
} from "./messageThreadUtils.js";

const MessageAttachments = ({ attachments = [], ownMessage = false }) => {
  if (!Array.isArray(attachments) || attachments.length === 0) {
    return null;
  }

  const imageAttachments = attachments.filter(isImageAttachment);
  const fileAttachments = attachments.filter(
    (attachment) => !isImageAttachment(attachment),
  );
  const shellClassName = ownMessage
    ? "border-primary-content/15 bg-primary-content/10 text-primary-content"
    : "border-base-300 bg-base-200/80 text-base-content";

  return (
    <div className="mt-3 space-y-3">
      {imageAttachments.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {imageAttachments.map((attachment) => (
            <a
              key={attachment.url}
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className={`overflow-hidden rounded-2xl border ${shellClassName}`}
            >
              <img
                src={attachment.url}
                alt={attachment.originalName || "Message attachment"}
                className="h-48 w-full object-cover"
              />
              <div className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {attachment.originalName || "Image"}
                  </div>
                  <div className="opacity-70">
                    {formatAttachmentSize(attachment.size)}
                  </div>
                </div>
                <ImageIcon size={14} className="shrink-0" />
              </div>
            </a>
          ))}
        </div>
      ) : null}

      {fileAttachments.length > 0 ? (
        <div className="space-y-2">
          {fileAttachments.map((attachment) => (
            <a
              key={attachment.url}
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 ${shellClassName}`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-xl bg-base-100/70 p-2 text-inherit">
                  <FileText size={16} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {attachment.originalName || "Attachment"}
                  </div>
                  <div className="text-xs opacity-70">
                    {formatAttachmentSize(attachment.size)}
                  </div>
                </div>
              </div>
              <Download size={16} className="shrink-0 opacity-80" />
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default MessageAttachments;
