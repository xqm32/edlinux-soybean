<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouterPush } from '@/hooks/common/router';
import { usePocketBase } from '@/store/modules/pb';

const pb = usePocketBase();
const { routerPush } = useRouterPush();

const courses = ref();
onMounted(async () => {
  courses.value = await pb.collection('courses').getFullList({ filter: `teacherId="${pb.authStore.model!.id}"` });
});
</script>

<template>
  <div>
    <NCard v-for="course in courses" :key="course.id">
      <NButton @click="routerPush(`/course/${course.id}`)">{{ course.name }}</NButton>
    </NCard>
  </div>
</template>
