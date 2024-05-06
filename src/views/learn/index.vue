<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useEdLinux } from '@/hooks/common/edlinux';
import { useRouterPush } from '@/hooks/common/router';

const { pb } = useEdLinux();
const { routerPush } = useRouterPush();

const courses = ref();
async function initCourses() {
  courses.value = await pb.collection('learn').getFullList({
    filter: `studentId="${pb.authStore.model!.id}"`,
    expand: 'courseId,courseId.teacherId'
  });
}

onBeforeMount(async () => {
  await Promise.all([initCourses()]);
});
</script>

<template>
  <div>
    <NGrid v-if="courses" x-gap="8" :cols="5">
      <NGridItem v-for="course in courses" :key="course.expand.courseId.id">
        <NCard :title="course.expand.courseId.name">
          <NButton @click="routerPush(`/course/${course.expand.courseId.id}`)">进入课程</NButton>
        </NCard>
      </NGridItem>
    </NGrid>
    <NEmpty v-else />
  </div>
</template>
