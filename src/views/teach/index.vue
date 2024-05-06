<script setup lang="ts">
import { onBeforeMount, reactive, ref } from 'vue';
import { useActive, useEdLinux } from '@/hooks/common/edlinux';
import { useRouterPush } from '@/hooks/common/router';

const { pb } = useEdLinux();
const { routerPush } = useRouterPush();

const courses = ref();
const initCourses = async () => {
  courses.value = await pb.collection('courses').getFullList({ filter: `teacherId="${pb.authStore.model!.id}"` });
};

const [active, activate] = useActive();
const courseModel = reactive({
  name: '',
  description: '',
  teacherId: pb.authStore.model!.id
});
async function createCourse() {
  await pb.collection('courses').create(courseModel);
  await initCourses();
  active.value = false;
  window.$message!.success('创建成功');
}

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
                  <NInput v-model:value="courseModel.name" />
                </NFormItem>
                <NFormItem label="课程描述">
                  <NInput v-model:value="courseModel.description" type="textarea" />
                </NFormItem>
              </NForm>
              <NFlex justify="center"><NButton @click="createCourse">创建</NButton></NFlex>
            </NDrawerContent>
          </NDrawer>
        </NCard>
      </NGridItem>
      <NGridItem v-for="course in courses" :key="course.id">
        <NCard :title="course.name">
          <NButton @click="routerPush(`/course/${course.id}`)">进入课程</NButton>
        </NCard>
      </NGridItem>
    </NGrid>
    <NEmpty v-else />
  </div>
</template>
