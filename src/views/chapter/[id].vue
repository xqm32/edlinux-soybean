<script setup lang="ts">
import { computed, onBeforeMount, ref, shallowRef } from 'vue';
import VuePdfEmbed from 'vue-pdf-embed';
import 'vue-pdf-embed/dist/style/index.css';
import 'vue-pdf-embed/dist/style/annotationLayer.css';
import 'vue-pdf-embed/dist/style/textLayer.css';
import { useActive, useEdLinux } from '@/hooks/common/edlinux';
import { useRouterPush } from '@/hooks/common/router';

const { pb, isTeacher, isStudent } = useEdLinux();
const { routerPush } = useRouterPush();
const props = defineProps<{ id: string }>();
const getFileUrl = (attachment: any) => pb.getFileUrl(attachment, attachment.content, { download: true });

const chapter = ref();
const chapterModel = ref({
  name: '',
  order: 0
});
const chapterContent = ref();
const [activeUpdate, activateUpdate] = useActive();
async function initChapter() {
  chapter.value = await pb.collection('chapters').getOne(props.id);
  chapterModel.value.name = chapter.value.name;
  chapterModel.value.order = chapter.value.order;
  const content = chapter.value.content;
  if (!content) return;
  chapterContent.value = [
    {
      id: content,
      name: content,
      url: pb.getFileUrl(content, content, { download: true }),
      status: 'finished'
    }
  ];
}
async function updateChapter() {
  await pb.collection('chapters').update(props.id, chapterModel.value);
  await initChapter();
  window.$message!.success('修改成功');
  activeUpdate.value = false;
}
async function updateChapterContent({ file }: any) {
  await pb.collection('chapters').update(props.id, { content: file.file });
  await initChapter();
}
async function deleteChapter() {
  await pb.collection('chapters').delete(props.id);
  window.$message!.success('删除成功');
  await routerPush(`/course/${chapter.value.courseId}`);
}
async function deleteChapterContent() {
  await pb.collection('chapters').update(props.id, { content: null });
  await initChapter();
}

const exercises = ref();
const records = shallowRef([]);
const finishedExercises = computed(() => new Set(records.value.map((item: any) => item.exerciseId)));
const initExercises = async () => {
  exercises.value = await pb
    .collection('exercises')
    .getFullList({ filter: `chapterId="${props.id}"`, sort: 'created' });
  records.value = await pb.collection('records').getFullList({ filter: `studentId="${pb.authStore.model!.id}"` });
};

const attachments = ref();
const fileList = ref();
const [active, activate] = useActive();
async function initAttachments() {
  attachments.value = await pb
    .collection('attachments')
    .getFullList({ filter: `chapterId="${props.id}"`, sort: 'created' });
}
async function initFileList() {
  fileList.value = attachments.value.map((attachment: any) => ({
    id: attachment.id,
    name: attachment.content,
    url: getFileUrl(attachment),
    status: 'finished'
  }));
}
async function createAttachment({ file }: any) {
  await pb.collection('attachments').create({ chapterId: props.id, content: file.file });
  await initAttachments();
}
async function deleteAttachment(data: any) {
  await pb.collection('attachments').delete(data.file.id);
  await initAttachments();
}

const exerciseModel = ref({
  name: '',
  content: '',
  cases: '',
  answer: ''
});
const [activeExercise, activateExercise] = useActive();
async function createExercise() {
  await pb.collection('exercises').create({ chapterId: props.id, ...exerciseModel.value });
  await initExercises();
  activeExercise.value = false;
  window.$message!.success('创建成功');
}

onBeforeMount(async () => {
  await Promise.all([initChapter(), initAttachments(), initExercises()]);
  await initFileList();
});
</script>

<template>
  <div v-if="chapter">
    <NGrid :cols="10" x-gap="8">
      <NGridItem :span="7">
        <NCard :title="chapter.name">
          <template #header-extra>
            <NButton v-if="isTeacher" @click="activateUpdate">编辑章节</NButton>
            <NDrawer v-model:show="activeUpdate" default-width="33%" resizable placement="right">
              <NDrawerContent title="编辑章节">
                <NForm>
                  <NFormItem label="章节标题">
                    <NInput v-model:value="chapterModel.name" />
                  </NFormItem>
                  <NFormItem label="章节排序">
                    <NInputNumber v-model:value="chapterModel.order" class="w-full" />
                  </NFormItem>
                </NForm>
                <NFlex justify="center"><NButton @click="updateChapter">提交</NButton></NFlex>
              </NDrawerContent>
            </NDrawer>
            <NPopconfirm v-if="isTeacher" @positive-click="deleteChapter">
              <template #trigger><NButton type="error" class="ml-2">删除章节</NButton></template>
              确认删除章节？
            </NPopconfirm>
          </template>
          <VuePdfEmbed
            v-if="chapter.content"
            annotation-layer
            text-layer
            :source="getFileUrl(chapter)"
            class="h-xl overflow-x-hidden overflow-y-scroll border"
          />
          <NEmpty v-else description="暂无课件" />
        </NCard>
      </NGridItem>
      <NGridItem :span="3">
        <NCard title="章节资源">
          <template #header-extra>
            <NButton v-if="isTeacher" @click="activate">管理资源</NButton>
            <NDrawer v-model:show="active" default-width="33%" resizable placement="right">
              <NDrawerContent title="管理资源">
                <NForm>
                  <NUpload
                    v-model:file-list="chapterContent"
                    :custom-request="updateChapterContent"
                    class="mb-2"
                    @remove="deleteChapterContent"
                  >
                    <NUploadDragger>上传课件</NUploadDragger>
                  </NUpload>
                  <NUpload v-model:file-list="fileList" :custom-request="createAttachment" @remove="deleteAttachment">
                    <NUploadDragger>上传附件</NUploadDragger>
                  </NUpload>
                </NForm>
              </NDrawerContent>
            </NDrawer>
            <NButton v-if="isTeacher" class="ml-2" @click="activateExercise">创建习题</NButton>
            <NDrawer v-model:show="activeExercise" default-width="50%" resizable placement="right">
              <NDrawerContent title="编辑习题">
                <NForm>
                  <NFormItem label="题目名称">
                    <NInput v-model:value="exerciseModel.name" />
                  </NFormItem>
                  <NFormItem label="题目描述">
                    <NInput v-model:value="exerciseModel.content" type="textarea" class="font-mono" :rows="8" />
                  </NFormItem>
                  <NFormItem label="测试用例（JSON格式）">
                    <NInput v-model:value="exerciseModel.cases" type="textarea" class="font-mono" :rows="8" />
                  </NFormItem>
                  <NFormItem label="正确答案">
                    <NInput v-model:value="exerciseModel.answer" type="textarea" class="font-mono" :rows="8" />
                  </NFormItem>
                </NForm>
                <NFlex justify="center"><NButton @click="createExercise">提交</NButton></NFlex>
              </NDrawerContent>
            </NDrawer>
          </template>
          <div v-if="chapter.content" class="mb-2">
            <NButton tag="a" :href="getFileUrl(chapter)" text>
              <NTag type="primary" class="mr-2">课件</NTag>
              {{ chapter.content }}
            </NButton>
          </div>
          <div v-if="attachments">
            <div v-for="attachment in attachments" :key="attachment.id" class="mb-2">
              <NButton tag="a" :href="getFileUrl(attachment)" text>
                <NTag class="mr-2">附件</NTag>
                {{ attachment.content.substring(0, 24) }}
              </NButton>
            </div>
          </div>
          <div v-if="exercises">
            <div v-for="exercise in exercises" :key="exercise.id" class="mb-2">
              <NButton text>
                <NTag type="success" class="mr-2">
                  习题
                  <span v-if="isStudent && finishedExercises.has(exercise.id)">&check;</span>
                </NTag>
                <RouterLink :to="`/exercise/${exercise.id}`">{{ exercise.name }}</RouterLink>
              </NButton>
            </div>
          </div>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>
