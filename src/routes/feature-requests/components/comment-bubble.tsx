import type { ReactNode } from "react";

/** Attached images as small thumbnails, each opening the full image in a new tab. */
export function AttachmentGallery({ urls }: { urls?: string[] }) {
  if (!urls?.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {urls.map((url, index) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-20 w-20 overflow-hidden rounded-lg border border-[#e3e3e3]"
        >
          <img
            src={url}
            alt={`Attachment ${index + 1}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </a>
      ))}
    </div>
  );
}

/** One comment: avatar initials, header line, body and images. Team replies get a blue card. */
export function CommentBubble({
  avatarText,
  isTeam,
  header,
  body,
  attachments,
  dimmed = false,
  actions,
}: {
  avatarText: string;
  isTeam: boolean;
  header: ReactNode;
  body: string;
  attachments?: string[];
  dimmed?: boolean;
  actions?: ReactNode;
}) {
  return (
    <div
      className="flex items-start gap-3"
      style={{ opacity: dimmed ? 0.5 : 1 }}
    >
      <span
        aria-hidden="true"
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          isTeam ? "bg-[#005bd3] text-white" : "bg-[#e0f0ff] text-[#004299]"
        }`}
      >
        {avatarText}
      </span>

      <div
        className={`min-w-0 flex-1 ${
          isTeam
            ? "rounded-lg border-0 border-l-[3px] border-solid border-[#005bd3] bg-[#eaf4ff] px-3 py-2.5"
            : "pt-1"
        }`}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-[#303030]">
          {header}
        </div>
        <p className="m-0 mt-1 whitespace-pre-wrap break-words text-[#616161]">
          {body}
        </p>
        <AttachmentGallery urls={attachments} />
      </div>

      {actions !== undefined ? (
        <div className="flex w-8 shrink-0 justify-center pt-0.5">{actions}</div>
      ) : null}
    </div>
  );
}
