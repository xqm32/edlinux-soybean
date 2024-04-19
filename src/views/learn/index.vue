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
    .getFullList({ filter: `studentId="${pb.authStore.model!.id}"`, expand: 'courseId,courseId.teacherId' });
});
</script>

<template>
  <div>
    <NGrid x-gap="12" :cols="4">
      <NGridItem v-for="course in courses" :key="course.expand.courseId.id">
        <NCard :title="course.expand.courseId.name">
          {{ course }}
          <NButton @click="routerPush(`/course/${course.expand.courseId.id}`)">进入课程</NButton>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>
