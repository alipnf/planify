import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useMessage } from '@/lib/hooks/use-message';
import { useSavedSchedulesStore } from '@/lib/stores/saved';

export function ShareDialog() {
  const { showShareDialog, setShowShareDialog, shareUrl } =
    useSavedSchedulesStore();
  const [hasCopied, setHasCopied] = useState(false);
  const { showSuccess } = useMessage();

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setHasCopied(true);
    showSuccess('Link berhasil disalin!');
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bagikan Jadwal</DialogTitle>
          <DialogDescription>
            Siapa pun yang memiliki link ini dapat melihat jadwal Anda.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 pt-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" defaultValue={shareUrl} readOnly />
          </div>
          <Button type="submit" size="sm" className="px-3" onClick={handleCopy}>
            <span className="sr-only">Salin</span>
            {hasCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
