import { useGiteeAi } from "@/contexts/gitee-ai";
import { commands as giteeAiCommands } from "@hypr/plugin-gitee-ai";
import { Button } from "@hypr/ui/components/ui/button";
import { Input } from "@hypr/ui/components/ui/input";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useState } from "react";
import { toast } from "sonner";

interface RegisterFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function RegisterForm({ onClose, onSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { checkLoginStatus } = useGiteeAi((s) => ({
    checkLoginStatus: s.checkLoginStatus,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !verificationCode) {
      toast.error("请填写完整信息");
      return;
    }

    setIsLoading(true);
    try {
      await giteeAiCommands.verifyCode(email, verificationCode);

      toast.success("登陆成功");

      // 刷新当前窗口的登录状态
      await checkLoginStatus();

      // 通知主窗口更新登录状态
      try {
        const mainWindow = await WebviewWindow.getByLabel("main");
        if (mainWindow) {
          await mainWindow.emit("gitee-ai-login-success", { email });
        }
      } catch (error) {
        console.error(error);
      }

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      }, 100);
    } catch (error) {
      console.error(error);
      toast.error(JSON.stringify(error));
      toast.error((error as any)?.message || "登陆失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!email) {
      toast.error("请输入邮箱");
      return;
    }

    setIsSendingCode(true);
    try {
      await giteeAiCommands.sendVerificationCode(email);

      toast.success("验证码已发送");
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error((error as any)?.message || "发送验证码失败");
    } finally {
      setIsSendingCode(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-8 rounded-lg w-[400px]">
        <h2 className="text-2xl font-bold mb-6 text-center">登陆账号</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">邮箱</label>
            <Input
              type="email"
              placeholder="请输入邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">验证码</label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="请输入验证码"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                pattern="\d{6}"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSendCode}
                className="whitespace-nowrap"
                disabled={isSendingCode || countdown > 0}
              >
                {countdown > 0 ? `${countdown}秒后重试` : "发送验证码"}
              </Button>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              取消
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "登陆中..." : "登陆"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
