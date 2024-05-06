<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import VuePdfEmbed from 'vue-pdf-embed';
import 'vue-pdf-embed/dist/style/index.css';
import 'vue-pdf-embed/dist/style/annotationLayer.css';
import 'vue-pdf-embed/dist/style/textLayer.css';
import { useActive, useEdLinux } from '@/hooks/common/edlinux';
import { useRouterPush } from '@/hooks/common/router';

const { pb, isTeacher } = useEdLinux();
const { routerPush } = useRouterPush();
const props = defineProps<{ id: string }>();
const getFileUrl = (attachment: any) => pb.getFileUrl(attachment, attachment.content, { download: true });

const chapter = ref();
const chapterModel = ref({
  name: '',
  order: 0
});
const [activeUpdate, activateUpdate] = useActive();
async function initChapter() {
  chapter.value = await pb.collection('chapters').getOne(props.id);
  chapterModel.value.name = chapter.value.name;
  chapterModel.value.order = chapter.value.order;
}
async function updateChapter() {
  await pb.collection('chapters').update(props.id, chapterModel.value);
  await initChapter();
  window.$message!.success('修改成功');
  activeUpdate.value = false;
}
async function deleteChapter() {
  await pb.collection('chapters').delete(props.id);
  window.$message!.success('删除成功');
  await routerPush(`/course/${chapter.value.courseId}`);
}

const exercises = ref();
const initExercises = async () => {
  exercises.value = await pb
    .collection('exercises')
    .getFullList({ filter: `chapterId="${props.id}"`, sort: 'created' });
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

onBeforeMount(async () => {
  await Promise.all([initChapter(), initAttachments(), initExercises()]);
  await initFileList();
});
</script>

<template>
  <div v-if="chapter">
    <NGrid :cols="10">
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
              <NDrawerContent title="创建课程">
                <NForm>
                  <NUpload v-model:file-list="fileList" :custom-request="createAttachment" @remove="deleteAttachment">
                    <NUploadDragger>点击或者拖动文件到该区域来上传</NUploadDragger>
                  </NUpload>
                </NForm>
                <NFlex justify="center"><NButton>确定</NButton></NFlex>
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
                {{ attachment.content }}
              </NButton>
            </div>
          </div>
          <div v-if="exercises">
            <div v-for="exercise in exercises" :key="exercise.id" class="mb-2">
              <NButton text>
                <NTag type="success" class="mr-2">习题</NTag>
                <RouterLink :to="`/exercise/${exercise.id}`">{{ exercise.name }}</RouterLink>
              </NButton>
            </div>
          </div>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>
