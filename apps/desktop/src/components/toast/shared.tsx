import { Channel } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

import { commands as localLlmCommands } from "@hypr/plugin-local-llm";
import { commands as localSttCommands, SupportedModel } from "@hypr/plugin-local-stt";
import { commands as windowsCommands } from "@hypr/plugin-windows";
import { Button } from "@hypr/ui/components/ui/button";
import { Progress } from "@hypr/ui/components/ui/progress";
import { sonnerToast, toast } from "@hypr/ui/components/ui/toast";

export const DownloadProgress = ({
  channel,
  onComplete,
}: {
  channel: Channel<number>;
  onComplete?: () => void;
}) => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    channel.onmessage = (v) => {
      if (v < 0) {
        setError(true);
        return;
      }

      if (v > progress) {
        setProgress(v);
      }

      if (v >= 100 && onComplete) {
        onComplete();
      }
    };
  }, [channel, onComplete, progress]);

  if (error) {
    return (
      <div className="w-full">
        <div className="text-destructive font-medium">下载失败，请稍后重试</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <Progress value={progress} className="h-2" />
      <div className="text-xs text-right">{Math.round(progress)}%</div>
    </div>
  );
};

export function showSttModelDownloadToast(model: SupportedModel, onComplete?: () => void) {
  const sttChannel = new Channel();
  localSttCommands.downloadModel(model, sttChannel);

  const id = `stt-model-download-${model}`;

  toast(
    {
      id,
      title: "语音识别模型",
      content: (
        <div className="space-y-1">
          <div>下载语音识别模型中...</div>
          <DownloadProgress
            channel={sttChannel}
            onComplete={() => {
              sonnerToast.dismiss(id);
              localSttCommands.startServer();
              if (onComplete) {
                onComplete();
              }
            }}
          />
        </div>
      ),
      dismissible: false,
    },
  );
}

export function showLlmModelDownloadToast() {
  const llmChannel = new Channel();
  localLlmCommands.downloadModel(llmChannel);

  const id = "llm-model-download";

  toast(
    {
      id,
      title: "大语言模型",
      content: (
        <div className="space-y-1">
          <div>下载大语言模型中...</div>
          <DownloadProgress
            channel={llmChannel}
            onComplete={() => {
              sonnerToast.dismiss(id);
              localLlmCommands.startServer();
            }}
          />
        </div>
      ),
      dismissible: false,
    },
  );
}

export function enhanceFailedToast() {
  const id = "no-llm-connection";

  const handleClick = () => {
    windowsCommands.windowShow({ type: "settings" });
    sonnerToast.dismiss(id);
  };

  toast({
    id,
    title: "Failed to enhance meeting notes",
    content: (
      <div className="space-y-1">
        <div>Go to AI settings to check the status.</div>
        <Button variant="default" onClick={handleClick}>
          Open Settings
        </Button>
      </div>
    ),
    dismissible: true,
  });
}

export function enhanceCancelledToast() {
  toast({
    id: "enhance-cancelled",
    title: "增强已取消",
    content: "笔记增强操作已被用户取消",
    dismissible: true,
    duration: 3000,
  });
}
