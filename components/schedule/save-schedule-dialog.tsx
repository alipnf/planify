import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SaveScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scheduleName: string) => void;
  isSaving: boolean;
  defaultScheduleName?: string;
}

export function SaveScheduleDialog({
  isOpen,
  onClose,
  onSave,
  isSaving,
  defaultScheduleName,
}: SaveScheduleDialogProps) {
  const [scheduleName, setScheduleName] = useState('');

  useEffect(() => {
    if (isOpen && defaultScheduleName) {
      setScheduleName(defaultScheduleName);
    } else if (!isOpen) {
      setScheduleName(''); // Reset saat dialog ditutup
    }
  }, [isOpen, defaultScheduleName]);

  const handleSave = () => {
    if (scheduleName.trim()) {
      onSave(scheduleName.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Simpan Jadwal</DialogTitle>
          <DialogDescription>
            Beri nama jadwal Anda agar mudah ditemukan nanti.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nama Jadwal
            </Label>
            <Input
              id="name"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              className="col-span-3"
              placeholder="Contoh: Jadwal Semester 3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Batal
          </Button>
          <Button
            onClick={handleSave}
            disabled={!scheduleName.trim() || isSaving}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
