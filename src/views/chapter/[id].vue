<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { marked } from 'marked';
import { usePocketBase } from '@/store/modules/pb';
import { useRouterPush } from '@/hooks/common/router';

const props = defineProps<{
  id: string;
}>();

const pb = usePocketBase();
const { routerPush } = useRouterPush();

const [attachments, exercises, chapter] = [ref(), ref(), ref()];
const markdown = computed(() => {
  return marked(chapter.value.content);
});
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
      </template>
      <div v-html="markdown"></div>
      <NList v-if="attachments.length > 0" bordered>
        <NListItem v-for="attachment in attachments" :key="attachment.id">
          <NThing :title="attachment.content"></NThing>
          <a :href="pb.getFileUrl(attachment, attachment.content, { download: true })">下载</a>
        </NListItem>
      </NList>
      <NList v-if="exercises.length > 0" bordered>
        <NListItem v-for="exercise in exercises" :key="exercise.id">
          <NThing :title="exercise.name"></NThing>
          <NButton @click="routerPush(`/exercise/${exercise.id}`)">进入课程</NButton>
        </NListItem>
      </NList>
    </NCard>
  </div>
</template>
