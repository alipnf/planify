import { toast } from 'sonner';

export const useMessage = () => {
  const showSuccess = (message: string) => {
    toast.success(message);
  };

  const showError = (message: string) => {
    toast.error(message);
  };

  return { showSuccess, showError };
};
