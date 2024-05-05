<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { usePocketBase } from '@/store/modules/pb';

const pb = usePocketBase();

const courses = ref();
const initCourses = async () => {
  courses.value = await pb.collection('learn').getFullList({
    filter: `studentId="${pb.authStore.model!.id}"`,
    expand: 'courseId,courseId.teacherId'
  });
};

onBeforeMount(async () => {
  await Promise.all([initCourses()]);
});
</script>

<template>
  <div>
    <NGrid v-if="courses" x-gap="12" :cols="4">
      <NGridItem v-for="course in courses" :key="course.expand.courseId.id">
        <NCard :title="course.expand.courseId.name">
          <NButton>
            <RouterLink :to="`/course/${course.expand.courseId.id}`">进入课程</RouterLink>
          </NButton>
        </NCard>
      </NGridItem>
    </NGrid>
    <NEmpty v-else />
  </div>
</template>
