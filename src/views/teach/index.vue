<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useActive, useEdLinux } from '@/hooks/common/edlinux';

const { pb } = useEdLinux();

const courses = ref();
const initCourses = async () => {
  courses.value = await pb.collection('courses').getFullList({ filter: `teacherId="${pb.authStore.model!.id}"` });
};

const [active, activate] = useActive();

onBeforeMount(async () => {
  await Promise.all([initCourses()]);
});
</script>

<template>
  <div>
    <NGrid v-if="courses" x-gap="12" :cols="4">
      <NGridItem>
        <NCard>
          <template #header><NFlex justify="center" class="text-lg c-primary">开一门新课？</NFlex></template>
          <NFlex class="w-full" justify="center">
            <NButton type="primary" @click="activate">创建课程</NButton>
          </NFlex>
          <NDrawer v-model:show="active" default-width="33%" resizable placement="right">
            <NDrawerContent title="创建课程">
              <NForm>
                <NFormItem label="课程标题">
                  <NInput />
                </NFormItem>
              </NForm>
              <NFlex justify="center"><NButton>创建</NButton></NFlex>
            </NDrawerContent>
          </NDrawer>
        </NCard>
      </NGridItem>
      <NGridItem v-for="course in courses" :key="course.id">
        <NCard :title="course.name">
          <NButton>
            <RouterLink :to="`/course/${course.id}`">进入课程</RouterLink>
          </NButton>
        </NCard>
      </NGridItem>
    </NGrid>
    <NEmpty v-else />
  </div>
</template>
