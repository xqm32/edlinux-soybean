<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useEdLinux } from '@/hooks/common/edlinux';
import { useRouterPush } from '@/hooks/common/router';

const { pb } = useEdLinux();
const { routerPush } = useRouterPush();

const courses = ref();
async function initCourses() {
  courses.value = await pb.collection('courses').getFullList();
}

onBeforeMount(async () => {
  await Promise.all([initCourses()]);
});
</script>

<template>
  <div>
    <NGrid v-if="courses" x-gap="12" :cols="4">
      <NGridItem v-for="course in courses" :key="course.id">
        <NCard :title="course.name">
          <NButton @click="routerPush(`/course/${course.id}`)">进入课程</NButton>
        </NCard>
      </NGridItem>
    </NGrid>
    <NEmpty v-else />
  </div>
</template>
