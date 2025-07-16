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
import { Save } from 'lucide-react';
import { useCreateSchedule } from '@/lib/hooks/use-create-schedule';

interface SaveScheduleDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (scheduleName: string) => Promise<void>;
  isSaving?: boolean;
  defaultScheduleName?: string;
}

export function SaveScheduleDialog({
  isOpen,
  onClose,
  onSave,
  isSaving: externalIsSaving,
  defaultScheduleName,
}: SaveScheduleDialogProps = {}) {
  const createScheduleHook = useCreateSchedule();
  const [scheduleName, setScheduleName] = useState('');

  // Use external props if provided, otherwise use internal hook
  const isDialogOpen =
    isOpen !== undefined ? isOpen : createScheduleHook.isDialogOpen;
  const isSaving =
    externalIsSaving !== undefined
      ? externalIsSaving
      : createScheduleHook.isSaving;
  const handleConfirmSave = onSave || createScheduleHook.handleConfirmSave;

  const handleDialogClose = () => {
    if (isSaving) return;
    if (onClose) {
      onClose();
    } else {
      createScheduleHook.setIsDialogOpen(false);
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      setScheduleName(defaultScheduleName || '');
    }
  }, [isDialogOpen, defaultScheduleName]);

  const handleSave = async () => {
    if (scheduleName.trim()) {
      await handleConfirmSave(scheduleName.trim());
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Save className="h-5 w-5" />
            <span>Simpan Jadwal Kuliah</span>
          </DialogTitle>
          <DialogDescription>
            Beri nama yang deskriptif untuk jadwal ini agar mudah Anda kenali
            nanti.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <Label htmlFor="schedule-name">Nama Jadwal</Label>
          <Input
            id="schedule-name"
            value={scheduleName}
            onChange={(e) => setScheduleName(e.target.value)}
            placeholder="Contoh: Jadwal Semester Genap"
            disabled={isSaving}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleDialogClose}
            disabled={isSaving}
          >
            Batal
          </Button>
          <Button
            onClick={handleSave}
            disabled={!scheduleName.trim() || isSaving}
          >
            {isSaving && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {isSaving ? 'Menyimpan...' : 'Simpan Jadwal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
