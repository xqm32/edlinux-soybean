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
    <NGrid x-gap="12" :cols="4">
      <NGridItem v-for="course in courses" :key="course.id">
        <NCard :title="course.name">
          <NButton @click="routerPush(`/course/${course.id}`)">进入课程</NButton>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>
