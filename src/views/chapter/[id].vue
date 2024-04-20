<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import VuePdfEmbed from 'vue-pdf-embed';
import { usePocketBase } from '@/store/modules/pb';
import 'vue-pdf-embed/dist/style/index.css';
import 'vue-pdf-embed/dist/style/annotationLayer.css';
import 'vue-pdf-embed/dist/style/textLayer.css';

const props = defineProps<{
  id: string;
}>();

const pb = usePocketBase();

const active = ref(false);
function activate() {
  active.value = true;
}

const [attachments, exercises, chapter] = [ref(), ref(), ref()];
const content = computed(() => pb.getFileUrl(chapter.value, chapter.value.content, { download: true }));
onMounted(async () => {
  attachments.value = await pb
    .collection('attachments')
    .getFullList({ filter: `chapterId="${props.id}"`, sort: 'created' });
  exercises.value = await pb
    .collection('exercises')
    .getFullList({ filter: `chapterId="${props.id}"`, sort: 'created' });
  chapter.value = await pb.collection('chapters').getOne(props.id);
});
</script>

<template>
  <div>
    <NCard v-if="chapter" :title="chapter.name">
      <template #header-extra>
        {{ chapter.description }}
        <div v-if="pb.authStore.model!.roles.includes('R_TEACHER')" class="ml-2">
          <NButton @click="activate">编辑章节</NButton>
          <NDrawer v-model:show="active" default-width="33%" resizable placement="right">
            <NDrawerContent title="编辑章节">
              <NForm>
                <NFormItem label="章节标题"><NInput /></NFormItem>
                <NFormItem label="章节内容">
                  <NUpload multiple directory-dnd :max="5">
                    <NUploadDragger>
                      <NText>点击或者拖动文件到该区域来上传</NText>
                    </NUploadDragger>
                  </NUpload>
                </NFormItem>
                <NFormItem label="章节附件">
                  <NUpload multiple directory-dnd :max="5">
                    <NUploadDragger>
                      <NText>点击或者拖动文件到该区域来上传</NText>
                    </NUploadDragger>
                  </NUpload>
                </NFormItem>
              </NForm>
              <NFlex justify="center"><NButton>提交</NButton></NFlex>
            </NDrawerContent>
          </NDrawer>
        </div>
      </template>
      <NCard v-if="chapter.content" class="h-xl overflow-scroll" :scale="0.7">
        <VuePdfEmbed annotation-layer text-layer :source="content" />
      </NCard>
      <NEmpty v-else />
      <NCard v-if="attachments.length > 0" size="small" title="附件" :bordered="false">
        <NList :show-divider="false">
          <NListItem>
            {{ chapter.content }}
            <a :href="content" class="c-primary">下载</a>
          </NListItem>
          <NListItem v-for="attachment in attachments" :key="attachment.id">
            {{ attachment.content }}
            <a :href="pb.getFileUrl(attachment, attachment.content, { download: true })" class="c-primary">下载</a>
          </NListItem>
        </NList>
      </NCard>
      <NCard v-if="exercises.length > 0" size="small" title="习题" :bordered="false">
        <template v-if="pb.authStore.model!.roles.includes('R_TEACHER')" #header-extra>
          <NButton>添加习题</NButton>
        </template>
        <NList :show-divider="false">
          <NListItem v-for="exercise in exercises" :key="exercise.id">
            <RouterLink :to="`/exercise/${exercise.id}`" class="c-primary">{{ exercise.name }}</RouterLink>
            <NButton text class="ml-2 c-red">删除</NButton>
          </NListItem>
        </NList>
      </NCard>
    </NCard>
  </div>
</template>
