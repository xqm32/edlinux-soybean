<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useActive, useEdLinux } from '@/hooks/common/edlinux';

const { pb, isStudent, isTeacher } = useEdLinux();
const props = defineProps<{ id: string }>();

const chapters = ref();
const initChapters = async () => {
  chapters.value = await pb
    .collection('chapters')
    .getFullList({ filter: `courseId="${props.id}"`, sort: 'order,created' });
};

const course = ref();
const courseModel = reactive({
  name: '',
  description: '',
  teacherId: pb.authStore.model!.id
});
const joined = ref(false);
const initCourse = async () => {
  const learn = (
    await pb.collection('learn').getFullList({
      filter: `studentId="${pb.authStore.model!.id}"`,
      expand: 'courseId,courseId.teacherId'
    })
  ).map(item => item.expand!.courseId.id);
  course.value = await pb.collection('courses').getOne(props.id);
  courseModel.name = course.value.name;
  courseModel.description = course.value.description;
  joined.value = learn.includes(props.id);
};

const chapterModel = reactive({
  name: '',
  order: 0,
  courseId: props.id
});
const [active, activate] = useActive();
async function createChapter() {
  await pb.collection('chapters').create(chapterModel);
  await initChapters();
  active.value = false;
  window.$message!.success('创建成功');
}

const [editActive, editActivate] = useActive();
async function createCourse() {
  await pb.collection('courses').update(props.id, courseModel);
  await initCourse();
  editActive.value = false;
  window.$message!.success('修改成功');
}

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
            <NButton v-if="isTeacher" @click="editActivate">编辑课程</NButton>
            <NDrawer v-model:show="editActive" default-width="33%" resizable placement="right">
              <NDrawerContent title="创建课程">
                <NForm>
                  <NFormItem label="课程标题">
                    <NInput v-model:value="courseModel.name" />
                  </NFormItem>
                  <NFormItem label="课程描述">
                    <NInput v-model:value="courseModel.description" type="textarea" :rows="16" />
                  </NFormItem>
                </NForm>
                <NFlex justify="center"><NButton @click="createCourse">确定</NButton></NFlex>
              </NDrawerContent>
            </NDrawer>
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
