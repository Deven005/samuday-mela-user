// src/utils/showCustomToast.ts
import { toast, ToastOptions, ToastContent } from 'react-toastify';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ShowToastParams {
  title?: string;
  message: string;
  type?: ToastType;
  options?: ToastOptions;
}

export const showCustomToast = ({
  title,
  message,
  type = 'info',
  options = {},
}: ShowToastParams) => {
  const theme = getToastTheme();

  const content: ToastContent = (
    <div>
      {title && <p className="font-semibold mb-1">{title}</p>}
      <p>{message}</p>
    </div>
  );

  toast(content, {
    type,
    theme,
    position: 'top-right',
    hideProgressBar: false,
    autoClose: 4000,
    pauseOnHover: true,
    draggable: true,
    closeOnClick: true,
    ...options,
  });
};

const getToastTheme = (): 'light' | 'dark' | 'colored' => {
  // Read theme from localStorage or use system
  const savedTheme = localStorage.getItem('theme') || 'system';

  if (savedTheme === 'light') return 'light';
  if (savedTheme === 'dark') return 'dark';

  // For "system", use prefers-color-scheme
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};
