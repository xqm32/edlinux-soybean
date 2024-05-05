import type { Ref } from 'vue';
import { ref } from 'vue';
import { usePocketBase } from '@/store/modules/pb';

export function useActive(): [Ref<boolean>, () => void] {
  const active = ref(false);
  const activate = () => {
    active.value = true;
  };
  return [active, activate];
}

export function useEdLinux() {
  const pb = usePocketBase();
  const isStudent = pb.authStore.model!.roles.includes('R_STUDENT');
  const isTeacher = pb.authStore.model!.roles.includes('R_TEACHER');
  return {
    pb,
    isStudent,
    isTeacher
  };
}
