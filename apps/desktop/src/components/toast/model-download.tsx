import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { commands as localLlmCommands } from "@hypr/plugin-local-llm";
import { commands as localSttCommands } from "@hypr/plugin-local-stt";
import { sonnerToast, toast } from "@hypr/ui/components/ui/toast";
import { showLlmModelDownloadToast, showSttModelDownloadToast } from "./shared";

export default function ModelDownloadNotification() {
  const currentSttModel = useQuery({
    queryKey: ["current-stt-model"],
    queryFn: () => localSttCommands.getCurrentModel(),
  });

  const checkForModelDownload = useQuery({
    enabled: !!currentSttModel.data,
    queryKey: ["check-model-downloaded"],
    queryFn: async () => {
      const [stt, llm] = await Promise.all([
        localSttCommands.isModelDownloaded(currentSttModel.data!),
        localLlmCommands.isModelDownloaded(),
      ]);

      return {
        currentSttModel,
        sttModelDownloaded: stt,
        llmModelDownloaded: llm,
      };
    },
    refetchInterval: 5000,
  });

  const sttModelDownloading = useQuery({
    enabled: !checkForModelDownload.data?.sttModelDownloaded,
    queryKey: ["stt-model-downloading"],
    queryFn: async () => {
      return localSttCommands.isModelDownloading(currentSttModel.data!);
    },
    refetchInterval: 3000,
  });

  const llmModelDownloading = useQuery({
    enabled: !checkForModelDownload.data?.llmModelDownloaded,
    queryKey: ["llm-model-downloading"],
    queryFn: async () => {
      return localLlmCommands.isModelDownloading();
    },
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (!checkForModelDownload.data) {
      return;
    }

    if (checkForModelDownload.data?.sttModelDownloaded && checkForModelDownload.data?.llmModelDownloaded) {
      return;
    }

    if (sttModelDownloading.data || llmModelDownloading.data) {
      return;
    }

    toast({
      id: "model-download-needed",
      title: "下载所必须的模型",
      content: "离线功能需要本地模型。",
      buttons: [
        {
          label: "下载模型",
          onClick: () => {
            sonnerToast.dismiss("model-download-needed");

            if (!checkForModelDownload.data?.sttModelDownloaded && !sttModelDownloading.data) {
              showSttModelDownloadToast(currentSttModel.data!);
            }

            if (!checkForModelDownload.data?.llmModelDownloaded && !llmModelDownloading.data) {
              showLlmModelDownloadToast();
            }
          },
          primary: true,
        },
      ],
      dismissible: false,
    });
  }, [checkForModelDownload.data, sttModelDownloading.data, llmModelDownloading.data]);

  return null;
}
