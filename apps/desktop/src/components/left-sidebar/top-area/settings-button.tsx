import { Trans } from "@lingui/react/macro";
import { getName, getVersion } from "@tauri-apps/api/app";
import { CogIcon, CpuIcon } from "lucide-react";
import { useState } from "react";

import Shortcut from "@/components/shortcut";
import { useGiteeAi } from "@/contexts/gitee-ai";
import { commands as windowsCommands } from "@hypr/plugin-windows";
import { Button } from "@hypr/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@hypr/ui/components/ui/dropdown-menu";
import { cn } from "@hypr/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";

export function SettingsButton() {
  const [open, setOpen] = useState(false);
  const { loginStatus, logout, freeTrialDaysRemaining } = useGiteeAi((s) => ({
    loginStatus: s.loginStatus,
    logout: s.logout,
    freeTrialDaysRemaining: s.freeTrialDaysRemaining,
  }));

  const versionQuery = useQuery({
    queryKey: ["appVersion"],
    queryFn: async () => {
      const [version, name] = await Promise.all([getVersion(), getName()]);
      return `${name} ${version}`;
    },
  });

  const handleClickSettings = () => {
    setOpen(false);
    windowsCommands.windowShow({ type: "settings" });
  };

  const handleClickPlans = () => {
    setOpen(false);
    windowsCommands.windowShow({ type: "subscription" });
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  const onClickPlans = () => {
    // 已登陆，且已购买
    if (loginStatus?.user_info?.purchase_status === "ACTIVE") {
      return;
    }
    handleClickPlans();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-neutral-200">
          <CogIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-52 p-0">
        <div
          className={cn([
            "px-2 py-3 bg-gradient-to-r rounded-t-md relative overflow-hidden cursor-pointer",
            "from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800",
          ])}
          onClick={onClickPlans}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDIwIDAgTCAwIDAgTCAwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiIHN0cm9rZS13aWR0aD0iMS41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-70">
          </div>
          <div className="flex items-center gap-3 text-white relative z-10">
            <CpuIcon className="size-8 animate-pulse" />
            <div>
              <div className="font-medium text-sm">
                {loginStatus?.user_info?.email || "游客模式"}
              </div>
              <div className="text-xs text-yellow-500 mt-0.5">
                {loginStatus?.user_info?.purchase_status === "ACTIVE" ? "Pro 版本" : (
                  freeTrialDaysRemaining && freeTrialDaysRemaining > 0
                    ? `剩余免费体验 ${freeTrialDaysRemaining} 天`
                    : "升级解锁高级 AI 模型"
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-1">
          <DropdownMenuItem
            onClick={handleClickSettings}
            className="cursor-pointer"
          >
            <Trans>Settings</Trans>
            <Shortcut macDisplay="⌘," windowsDisplay="Ctrl+," />
          </DropdownMenuItem>
          {loginStatus.is_logged_in && loginStatus.user_info?.email && (
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer"
            >
              退出登录
            </DropdownMenuItem>
          )}

          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            {versionQuery.data ?? "..."}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
