import { showSttModelDownloadToast } from "@/components/toast/shared";
import { commands as localSttCommands, SupportedModel } from "@hypr/plugin-local-stt";
import { Button } from "@hypr/ui/components/ui/button";
import { Label } from "@hypr/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@hypr/ui/components/ui/radio-group";
import { cn } from "@hypr/ui/lib/utils";
import { Trans } from "@lingui/react/macro";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BrainIcon, DownloadIcon, Zap as SpeedIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const sttModelMetadata: Record<SupportedModel, {
  name: string;
  description: string;
  intelligence: number;
  speed: number;
  size: string;
  inputType: string[];
  outputType: string[];
  languageSupport: "multilingual" | "english-only";
  huggingface?: string;
}> = {
  "QuantizedTiny": {
    name: "微型模型",
    description: "最快速度，最低精度。适合离线、低资源使用。",
    intelligence: 1,
    speed: 3,
    size: "44 MB",
    inputType: ["audio"],
    outputType: ["text"],
    languageSupport: "multilingual",
    huggingface: "https://huggingface.co/ggerganov/whisper.cpp/blob/main/ggml-tiny-q8_0.bin",
  },
  "QuantizedBase": {
    name: "基础模型",
    description: "多语言使用的速度和精度的良好平衡。",
    intelligence: 2,
    speed: 2,
    size: "82 MB",
    inputType: ["audio"],
    outputType: ["text"],
    languageSupport: "multilingual",
    huggingface: "https://huggingface.co/ggerganov/whisper.cpp/blob/main/ggml-base-q8_0.bin",
  },
  "QuantizedSmall": {
    name: "小型模型",
    description: "更高精度，多语言转录的中等速度。",
    intelligence: 3,
    speed: 2,
    size: "264 MB",
    inputType: ["audio"],
    outputType: ["text"],
    languageSupport: "multilingual",
    huggingface: "https://huggingface.co/ggerganov/whisper.cpp/blob/main/ggml-small-q8_0.bin",
  },
  "QuantizedLargeTurbo": {
    name: "大型模型",
    description: "最高精度，可能比标准大型模型更快。资源密集型。",
    intelligence: 3,
    speed: 1,
    size: "874 MB",
    inputType: ["audio"],
    outputType: ["text"],
    languageSupport: "multilingual",
    huggingface: "https://huggingface.co/ggerganov/whisper.cpp/blob/main/ggml-large-v3-turbo-q8_0.bin",
  },
};

export const RatingDisplay = (
  { label, rating, maxRating = 3, icon: Icon }: {
    label: string;
    rating: number;
    maxRating?: number;
    icon: React.ElementType;
  },
) => (
  <div className="flex flex-col items-center px-2">
    <span className="text-[10px] text-neutral-500 uppercase font-medium tracking-wider mb-1.5">{label}</span>
    <div className="flex space-x-1">
      {[...Array(maxRating)].map((_, i) => (
        <Icon
          key={i}
          className={cn(
            "w-3.5 h-3.5",
            i < rating ? "text-black fill-current" : "text-neutral-300",
          )}
          strokeWidth={i < rating ? 0 : 1.5}
        />
      ))}
    </div>
  </div>
);

export const LanguageDisplay = ({ support }: { support: "multilingual" | "english-only" }) => {
  return (
    <div className="flex flex-col items-center px-2">
      <span className="text-[10px] text-neutral-500 uppercase font-medium tracking-wider mb-1.5">
        语言
      </span>
      <div className="text-xs font-medium">
        {support === "multilingual" ? "多语言" : "仅英语"}
      </div>
    </div>
  );
};

export function STTView() {
  const queryClient = useQueryClient();
  const [downloadingModelName, setDownloadingModelName] = useState<string | null>(null);

  const currentSTTModel = useQuery({
    queryKey: ["local-stt", "current-model"],
    queryFn: () => localSttCommands.getCurrentModel(),
  });

  const setCurrentSTTModel = useMutation({
    mutationFn: (model: SupportedModel) => localSttCommands.setCurrentModel(model),
    onSuccess: () => {
      currentSTTModel.refetch();
    },
  });

  const supportedSTTModels = useQuery({
    queryKey: ["local-stt", "supported-models"],
    queryFn: async () => {
      const models = await localSttCommands.listSupportedModels();
      const downloadedModels = await Promise.all(models.map((model) => localSttCommands.isModelDownloaded(model)));
      return models.map((model, index) => ({ model, isDownloaded: downloadedModels[index] }));
    },
  });

  return (
    <RadioGroup
      defaultValue={currentSTTModel.data}
      onValueChange={(value) => {
        setCurrentSTTModel.mutate(value as SupportedModel);
      }}
      className="flex flex-col gap-4 flex-1"
    >
      {supportedSTTModels.data?.map((model) => {
        const metadata = sttModelMetadata[model.model as keyof typeof sttModelMetadata];
        const isSelected = currentSTTModel.data === model.model;
        const isDownloaded = model.isDownloaded;
        const isCurrentlyDownloading = downloadingModelName === model.model;

        return (
          <Label
            key={model.model}
            htmlFor={model.model}
            onClick={(e) => {
              if (!isDownloaded) {
                e.preventDefault();
                toast.info("您需要先下载此模型才能使用。", {
                  duration: 2500,
                });
              }
            }}
            className={cn(
              "relative rounded-lg p-4 flex flex-col transition-all",
              isDownloaded
                ? isSelected
                  ? "border border-blue-500 ring-2 ring-blue-500 bg-blue-50 cursor-pointer"
                  : "border border-neutral-200 bg-white cursor-pointer hover:border-neutral-300"
                : "border border-neutral-300 bg-neutral-100",
              !metadata && "items-center",
            )}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between w-full">
                <div>
                  <RadioGroupItem
                    value={model.model}
                    id={model.model}
                    className="peer absolute w-0 h-0 opacity-0"
                    disabled={!isDownloaded}
                  />

                  <a
                    href={metadata?.huggingface}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline decoration-dotted"
                  >
                    {metadata?.name || model.model}
                  </a>
                </div>
              </div>

              {metadata?.description && (
                <div className="text-xs text-neutral-600">
                  {metadata.description}
                </div>
              )}
            </div>

            {metadata && (
              <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between w-full">
                <div className="flex divide-x divide-neutral-200 -mx-2">
                  <RatingDisplay label="智能程度" rating={metadata.intelligence} icon={BrainIcon} />
                  <RatingDisplay label="速度" rating={metadata.speed} icon={SpeedIcon} />
                  <LanguageDisplay support={metadata.languageSupport} />
                </div>

                <div className="flex flex-col items-end space-y-1.5">
                  {!isDownloaded
                    && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (isCurrentlyDownloading || supportedSTTModels.isFetching) {
                            return;
                          }

                          setDownloadingModelName(model.model);

                          try {
                            showSttModelDownloadToast(model.model, () => {
                              queryClient.invalidateQueries({ queryKey: ["local-stt", "supported-models"] })
                                .catch((invalidationError) => {
                                  console.error(
                                    `Error during query invalidation for ${model.model}:`,
                                    invalidationError,
                                  );
                                })
                                .finally(() => {
                                  setDownloadingModelName(null);
                                });
                            });
                          } catch (error) {
                            console.error(`Error initiating STT model download for ${model.model}:`, error);
                            setDownloadingModelName(null);
                          }
                        }}
                        disabled={supportedSTTModels.isFetching || isCurrentlyDownloading}
                      >
                        <DownloadIcon className="w-4 h-4" />
                        <Trans>Download {metadata?.size && `(${metadata.size})`}</Trans>
                      </Button>
                    )}
                </div>
              </div>
            )}
          </Label>
        );
      })}
      {!supportedSTTModels.data?.length && (
        <div className="text-sm text-neutral-500 py-2 text-center">
          <Trans>没有可用的语音转文本模型或加载失败。</Trans>
        </div>
      )}
    </RadioGroup>
  );
}
