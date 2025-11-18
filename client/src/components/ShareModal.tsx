import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Check, Copy, Facebook, Link as LinkIcon, Share2, Twitter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  planId: number;
}

export default function ShareModal({ open, onClose, planId }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const generateLink = trpc.share.generateLink.useMutation({
    onSuccess: (data: any) => {
      setShareUrl(data.url);
      toast.success("Link gerado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao gerar link");
    },
  });

  const handleGenerateLink = () => {
    generateLink.mutate({ planId });
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (shareUrl) {
      const text = encodeURIComponent(`Confira meu plano de marmitas! ${shareUrl}`);
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }
  };

  const handleShareFacebook = () => {
    if (shareUrl) {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        "_blank"
      );
    }
  };

  const handleShareTwitter = () => {
    if (shareUrl) {
      const text = encodeURIComponent("Confira meu plano de marmitas!");
      window.open(
        `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`,
        "_blank"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartilhar Plano
          </DialogTitle>
          <DialogDescription>
            Compartilhe seu plano de marmitas com amigos e família
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!shareUrl ? (
            <div className="text-center py-4">
              <Button onClick={handleGenerateLink} disabled={generateLink.isPending}>
                {generateLink.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gerando link...
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Gerar Link de Compartilhamento
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Qualquer pessoa com o link poderá visualizar este plano
              </p>
            </div>
          ) : (
            <>
              {/* Copy Link */}
              <div className="flex items-center gap-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              {/* Share Buttons */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Compartilhar via:</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={handleShareWhatsApp}
                    className="w-full"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    WhatsApp
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleShareFacebook}
                    className="w-full"
                  >
                    <Facebook className="h-5 w-5 mr-2" />
                    Facebook
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleShareTwitter}
                    className="w-full"
                  >
                    <Twitter className="h-5 w-5 mr-2" />
                    Twitter
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                💡 O link permanecerá ativo até que você o revogue
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

