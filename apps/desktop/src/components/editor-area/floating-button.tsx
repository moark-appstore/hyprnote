import { RefreshCwIcon, TypeOutlineIcon, XIcon, ZapIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { useEnhancePendingState } from "@/hooks/enhance-pending";
import { Session } from "@hypr/plugin-db";
import { SplashLoader as EnhanceWIP } from "@hypr/ui/components/ui/splash";
import { cn } from "@hypr/ui/lib/utils";
import { useOngoingSession, useSession } from "@hypr/utils/contexts";

interface FloatingButtonProps {
  session: Session;
  handleEnhance: () => void;
}

export function FloatingButton({
  session,
  handleEnhance,
}: FloatingButtonProps) {
  const [showRaw, setShowRaw] = useSession(session.id, (s) => [
    s.showRaw,
    s.setShowRaw,
  ]);
  const cancelEnhance = useOngoingSession((s) => s.cancelEnhance);
  const isEnhancePending = useEnhancePendingState(session.id);
  const [isHovered, setIsHovered] = useState(false);
  const [showRefreshIcon, setShowRefreshIcon] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      setShowRefreshIcon(true);
    }
  }, [isHovered]);

  useEffect(() => {
    if (!isEnhancePending && isCancelling) {
      setIsCancelling(false);
    }
  }, [isEnhancePending, isCancelling]);

  const handleRawView = () => {
    setShowRaw(true);
  };

  const handleEnhanceOrReset = () => {
    if (showRaw) {
      setShowRaw(false);
      setShowRefreshIcon(false);
      return;
    }

    if (isEnhancePending) {
      setIsCancelling(true);
      cancelEnhance();
    } else {
      handleEnhance();
    }
  };

  if (!session.enhanced_memo_html && !isEnhancePending) {
    return null;
  }

  const rawButtonClasses = cn(
    "rounded-l-xl border-l border-y",
    "border-border px-4 py-2.5 transition-all ease-in-out",
    showRaw
      ? "bg-primary text-primary-foreground border-black hover:bg-neutral-800"
      : "bg-background text-neutral-400 hover:bg-neutral-100",
    (isEnhancePending || isCancelling) && "opacity-75",
  );

  const enhanceButtonClasses = cn(
    "rounded-r-xl border-r border-y",
    "border border-border px-4 py-2.5 transition-all ease-in-out",
    showRaw
      ? "bg-background text-neutral-400 hover:bg-neutral-100"
      : "bg-primary text-primary-foreground border-black hover:bg-neutral-800",
    isCancelling && "opacity-75",
  );

  const showRefresh = !showRaw && isHovered && showRefreshIcon;

  return (
    <div className="flex w-fit flex-row items-center group hover:scale-105 transition-transform duration-200">
      <button
        disabled={isEnhancePending || isCancelling}
        onClick={handleRawView}
        className={rawButtonClasses}
        title={isEnhancePending ? "增强进行中..." : "查看原始内容"}
      >
        <TypeOutlineIcon size={20} />
      </button>

      <button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleEnhanceOrReset}
        className={enhanceButtonClasses}
        disabled={isCancelling}
        title={isCancelling
          ? "正在取消..."
          : isEnhancePending
          ? "点击取消增强"
          : showRaw
          ? "查看增强内容"
          : "重新增强"}
      >
        {isCancelling
          ? <EnhanceWIP size={20} strokeWidth={2} />
          : isEnhancePending
          ? isHovered
            ? <XIcon size={20} />
            : <EnhanceWIP size={20} strokeWidth={2} />
          : <RunOrRerun showRefresh={showRefresh} />}
      </button>
    </div>
  );
}

function RunOrRerun({ showRefresh }: { showRefresh: boolean }) {
  return (
    <div className="relative h-5 w-5">
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          showRefresh ? "opacity-100" : "opacity-0",
        )}
      >
        <RefreshCwIcon size={20} />
      </div>
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          showRefresh ? "opacity-0" : "opacity-100",
        )}
      >
        <ZapIcon size={20} />
      </div>
    </div>
  );
}
