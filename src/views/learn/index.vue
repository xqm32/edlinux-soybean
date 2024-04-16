<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouterPush } from '@/hooks/common/router';
import { usePocketBase } from '@/store/modules/pb';

const pb = usePocketBase();
const { routerPush } = useRouterPush();

const courses = ref();
onMounted(async () => {
  courses.value = await pb
    .collection('learn')
    .getFullList({ filter: `studentId="${pb.authStore.model!.id}"`, expand: 'courseId' });
});
</script>

<template>
  <div>
    <NCard v-for="course in courses" :key="course.expand.courseId.id">
      <NButton @click="routerPush(`/course/${course.expand.courseId.id}`)">{{ course.expand.courseId.name }}</NButton>
    </NCard>
  </div>
</template>
