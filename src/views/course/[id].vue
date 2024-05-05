<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useActive, useEdLinux } from '@/hooks/common/edlinux';

const { pb, isStudent, isTeacher } = useEdLinux();
const props = defineProps<{ id: string }>();

const chapters = ref();
const initChapters = async () => {
  chapters.value = await pb.collection('chapters').getFullList({ filter: `courseId="${props.id}"`, sort: 'order' });
};

const course = ref();
const joined = ref(false);
const initCourse = async () => {
  const learn = (
    await pb.collection('learn').getFullList({
      filter: `studentId="${pb.authStore.model!.id}"`,
      expand: 'courseId,courseId.teacherId'
    })
  ).map(item => item.expand!.courseId.id);
  course.value = await pb.collection('courses').getOne(props.id);
  joined.value = learn.includes(props.id);
};

const [active, activate] = useActive();

onMounted(async () => {
  Promise.all([initCourse(), initChapters()]);
});
</script>

<template>
  <div v-if="course">
    <NGrid :cols="10">
      <NGridItem :span="7">
        <NCard :title="course.name">
          <template #header-extra>
            <NButton v-if="isStudent && !joined">加入课程</NButton>
            <NButton v-if="isStudent && joined" type="error">退出课程</NButton>
            <NButton v-if="isTeacher">编辑课程</NButton>
          </template>
          <NCode :code="course.description" word-wrap />
        </NCard>
      </NGridItem>
      <NGridItem :span="3">
        <NCard title="课程章节">
          <template v-if="isTeacher" #header-extra>
            <div class="ml-2">
              <NButton @click="activate">创建章节</NButton>
              <NDrawer v-model:show="active" default-width="33%" resizable placement="right">
                <NDrawerContent title="创建章节">
                  <NForm>
                    <NFormItem label="章节标题">
                      <NInput />
                    </NFormItem>
                  </NForm>
                  <NFlex justify="center"><NButton>创建</NButton></NFlex>
                </NDrawerContent>
              </NDrawer>
            </div>
          </template>
          <div v-if="chapters">
            <div v-for="chapter in chapters" :key="chapter.id" class="mb-2">
              <NButton text>
                <RouterLink :to="`/chapter/${chapter.id}`">{{ chapter.name }}</RouterLink>
              </NButton>
            </div>
          </div>
          <NEmpty v-else />
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>
