import { useQuery } from "@tanstack/react-query";
import { useMatch } from "@tanstack/react-router";

import { DeleteNoteButton } from "@/components/toolbar/buttons/delete-note-button";
import { NewNoteButton } from "@/components/toolbar/buttons/new-note-button";
import { NewWindowButton } from "@/components/toolbar/buttons/new-window-button";
import { useLeftSidebar } from "@/contexts";
import { useGiteeAi } from "@/contexts/gitee-ai";
import { commands as flagsCommands } from "@hypr/plugin-flags";
import { commands as windowsCommands } from "@hypr/plugin-windows";
import { getCurrentWebviewWindowLabel } from "@hypr/plugin-windows";
import { Button } from "@hypr/ui/components/ui/button";
import { cn } from "@hypr/ui/lib/utils";
import { SearchBar } from "../../search-bar";
import { ChatPanelButton } from "../buttons/chat-panel-button";
import { LeftSidebarButton } from "../buttons/left-sidebar-button";
import { TranscriptPanelButton } from "../buttons/transcript-panel-button";

export function MainToolbar() {
  const { loginStatus } = useGiteeAi((s) => ({
    loginStatus: s.loginStatus,
  }));
  const noteMatch = useMatch({ from: "/app/note/$id", shouldThrow: false });
  const organizationMatch = useMatch({
    from: "/app/organization/$id",
    shouldThrow: false,
  });
  const humanMatch = useMatch({ from: "/app/human/$id", shouldThrow: false });
  const { isExpanded } = useLeftSidebar();

  const isNote = !!noteMatch;
  const isMain = getCurrentWebviewWindowLabel() === "main";

  const noteChatQuery = useQuery({
    queryKey: ["flags", "ChatRightPanel"],
    queryFn: () => flagsCommands.isEnabled("ChatRightPanel"),
  });

  const handleUpgradePro = () => {
    windowsCommands.windowShow({ type: "subscription" });
  };

  return (
    <header
      data-tauri-drag-region
      className={cn([
        "flex w-full items-center justify-between min-h-11 py-1 px-2 border-b",
        isMain
          ? "border-border bg-neutral-50"
          : "border-transparent bg-transparent",
        !isExpanded && "pl-[72px]",
      ])}
    >
      <div
        className="w-40 flex items-center justify-start"
        data-tauri-drag-region
      >
        {isNote && (
          <>
            <LeftSidebarButton type="toolbar" />
            <NewNoteButton />
            <DeleteNoteButton />
          </>
        )}
      </div>

      <SearchBar />

      <div
        className="flex w-40 items-center justify-end"
        data-tauri-drag-region
      >
        {(!loginStatus.is_logged_in
          || loginStatus.user_info?.purchase_status !== "ACTIVE") && (
          <Button size="sm" className="mr-2" onClick={handleUpgradePro}>
            升级 Pro
          </Button>
        )}

        {isMain && (
          <>
            {/* {isNote && <ShareButton />} */}
            {(organizationMatch || humanMatch) && <NewWindowButton />}
            {noteChatQuery.data && <ChatPanelButton />}
            <TranscriptPanelButton />
          </>
        )}
      </div>
    </header>
  );
}
