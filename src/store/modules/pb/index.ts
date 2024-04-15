import PocketBase from 'pocketbase';

export const usePocketBase = () => {
  return new PocketBase(import.meta.env.VITE_POCKET_BASE_URL);
};
