<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import VuePdfEmbed from 'vue-pdf-embed';
import 'vue-pdf-embed/dist/style/index.css';
import 'vue-pdf-embed/dist/style/annotationLayer.css';
import 'vue-pdf-embed/dist/style/textLayer.css';
import type { UploadFileInfo } from 'naive-ui';
import { useActive, useEdLinux } from '@/hooks/common/edlinux';
import { useRouterPush } from '@/hooks/common/router';

const { pb, isTeacher } = useEdLinux();
const { routerPush } = useRouterPush();
const props = defineProps<{ id: string }>();
const getFileUrl = (attachment: any) => pb.getFileUrl(attachment, attachment.content, { download: true });

const attachments = ref();
const fileList = ref();
const initAttachments = async () => {
  attachments.value = await pb
    .collection('attachments')
    .getFullList({ filter: `chapterId="${props.id}"`, sort: 'created' });
  fileList.value = attachments.value?.map((attachment: any) => ({
    id: attachment.id,
    name: attachment.content,
    url: getFileUrl(attachment),
    status: 'finished'
  }));
};

const exercises = ref();
const initExercises = async () => {
  exercises.value = await pb
    .collection('exercises')
    .getFullList({ filter: `chapterId="${props.id}"`, sort: 'created' });
};

const chapter = ref();
const initChapter = async () => {
  chapter.value = await pb.collection('chapters').getOne(props.id);
};

async function deleteChapter() {
  await pb.collection('chapters').delete(props.id);
  window.$message!.success('删除成功');
  await routerPush(`/course/${chapter.value.courseId}`);
}

const [active, activate] = useActive();
async function handleRemove(data: { file: UploadFileInfo; fileList: UploadFileInfo[] }) {
  await pb.collection('attachments').delete(data.file.id);
  await initAttachments();
}
async function uploadFile({ file }: any) {
  await pb.collection('attachments').create({ chapterId: props.id, content: file.file });
  await initAttachments();
}

onBeforeMount(async () => {
  await Promise.all([initChapter(), initAttachments(), initExercises()]);
});
</script>

<template>
  <div v-if="chapter">
    <NGrid :cols="10">
      <NGridItem :span="7">
        <NCard :title="chapter.name">
          <template #header-extra>
            <NPopconfirm v-if="isTeacher" @positive-click="deleteChapter">
              <template #trigger><NButton type="error">删除章节</NButton></template>
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
                  <NUpload v-model:file-list="fileList" :custom-request="uploadFile" @remove="handleRemove">
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
