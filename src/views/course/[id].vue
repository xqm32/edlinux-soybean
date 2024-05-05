<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouterPush } from '@/hooks/common/router';
import { useActive, useEdLinux } from '@/hooks/common/edlinux';

const { pb, isStudent, isTeacher } = useEdLinux();
const props = defineProps<{ id: string }>();
const { routerPush } = useRouterPush();

const chapters = ref();
const initChapters = async () => {
  chapters.value = await pb.collection('chapters').getFullList({ filter: `courseId="${props.id}"`, sort: 'order' });
};

const course = ref();
const initCourse = async () => {
  course.value = await pb.collection('courses').getOne(props.id);
};

const [active, activate] = useActive();

onMounted(async () => {
  Promise.all([initCourse(), initChapters()]);
});
</script>

<template>
  <div>
    <NCard v-if="course" :title="course.name">
      <template #header-extra>
        <NButton v-if="isStudent" class="ml-2">加入课程</NButton>
        <div v-if="isTeacher" class="ml-2">
          <NButton @click="activate">创建章节</NButton>
          <NDrawer v-model:show="active" default-width="33%" resizable placement="right">
            <NDrawerContent title="创建章节">
              <NForm>
                <NFormItem label="章节标题">
                  <NInput :value="course.name" />
                </NFormItem>
              </NForm>
              <NFlex justify="center"><NButton>创建</NButton></NFlex>
            </NDrawerContent>
          </NDrawer>
        </div>
      </template>
      <NCard :bordered="false">{{ course.description }}</NCard>
      <NList v-if="chapters.length > 0" bordered>
        <NListItem v-for="chapter in chapters" :key="chapter.id">
          <NThing :title="chapter.name"></NThing>
          <NButton @click="routerPush(`/chapter/${chapter.id}`)">进入章节</NButton>
        </NListItem>
      </NList>
      <NEmpty v-else />
    </NCard>
  </div>
</template>
