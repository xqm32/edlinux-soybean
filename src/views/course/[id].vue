<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useActive, useEdLinux } from '@/hooks/common/edlinux';
import { useRouterPush } from '@/hooks/common/router';

const { pb, isStudent, isTeacher } = useEdLinux();
const { routerPush } = useRouterPush();
const props = defineProps<{ id: string }>();

const chapters = ref();
const chapterModel = ref({
  name: '',
  order: 0,
  courseId: props.id
});
const [active, activate] = useActive();
async function initChapters() {
  chapters.value = await pb
    .collection('chapters')
    .getFullList({ filter: `courseId="${props.id}"`, sort: 'order,created' });
}
async function createChapter() {
  await pb.collection('chapters').create(chapterModel.value);
  await initChapters();
  chapterModel.value = {
    name: '',
    order: 0,
    courseId: props.id
  };
  active.value = false;
  window.$message!.success('创建成功');
}

const course = ref();
const courseModel = ref({
  name: '',
  description: '',
  teacherId: pb.authStore.model!.id
});
const joined = ref(false);
const learnId = ref();
const [activeUpdate, activateUpdate] = useActive();
async function initCourse() {
  const learn = await pb.collection('learn').getFullList({
    filter: `studentId="${pb.authStore.model!.id}"`,
    expand: 'courseId,courseId.teacherId'
  });
  course.value = await pb.collection('courses').getOne(props.id);
  courseModel.value.name = course.value.name;
  courseModel.value.description = course.value.description;
  joined.value = learn.map(item => item.expand!.courseId.id).includes(props.id);
  learnId.value = learn.find(item => item.expand!.courseId.id === props.id)?.id;
}
async function updateCourse() {
  await pb.collection('courses').update(props.id, courseModel.value);
  await initCourse();
  activeUpdate.value = false;
  window.$message!.success('修改成功');
}
async function deleteCourse() {
  await pb.collection('courses').delete(props.id);
  window.$message!.success('删除成功');
  await routerPush('/teach');
}
async function joinCourse() {
  await pb.collection('learn').create({ courseId: props.id, studentId: pb.authStore.model!.id });
  await initCourse();
  window.$message!.success('加入成功');
}
async function exitCourse() {
  await pb.collection('learn').delete(learnId.value);
  await initCourse();
  window.$message!.success('退出成功');
}

onBeforeMount(async () => {
  Promise.all([initCourse(), initChapters()]);
});
</script>

<template>
  <div v-if="course">
    <NGrid :cols="10" x-gap="8">
      <NGridItem :span="7">
        <NCard :title="course.name">
          <template #header-extra>
            <NButton v-if="isStudent && !joined" @click="joinCourse">加入课程</NButton>
            <NPopconfirm v-if="isStudent && joined" @positive-click="exitCourse">
              <template #trigger><NButton type="error">退出课程</NButton></template>
              确认退出课程？
            </NPopconfirm>
            <NButton v-if="isTeacher" @click="activateUpdate">编辑课程</NButton>
            <NDrawer v-model:show="activeUpdate" default-width="33%" resizable placement="right">
              <NDrawerContent title="创建课程">
                <NForm>
                  <NFormItem label="课程标题">
                    <NInput v-model:value="courseModel.name" />
                  </NFormItem>
                  <NFormItem label="课程描述">
                    <NInput v-model:value="courseModel.description" type="textarea" :rows="16" class="font-mono" />
                  </NFormItem>
                </NForm>
                <NFlex justify="center"><NButton @click="updateCourse">确定</NButton></NFlex>
              </NDrawerContent>
            </NDrawer>
            <NPopconfirm v-if="isTeacher" @positive-click="deleteCourse">
              <template #trigger><NButton type="error" class="ml-2">删除课程</NButton></template>
              确认删除课程？此操作不可恢复！
            </NPopconfirm>
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
                      <NInput v-model:value="chapterModel.name" />
                    </NFormItem>
                    <NFormItem label="章节排序">
                      <NInputNumber v-model:value="chapterModel.order" class="w-full" />
                    </NFormItem>
                  </NForm>
                  <NFlex justify="center"><NButton @click="createChapter">创建</NButton></NFlex>
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
