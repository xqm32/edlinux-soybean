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

const [attachments, exercises, chapter] = [ref(), ref(), ref()];
const content = computed(() => pb.getFileUrl(chapter.value, chapter.value.content));
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
      <NCard class="h-2xl overflow-scroll">
        <VuePdfEmbed annotation-layer text-layer :source="content" />
      </NCard>
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
        <NList :show-divider="false">
          <NListItem v-for="exercise in exercises" :key="exercise.id">
            <RouterLink :to="`/exercise/${exercise.id}`" class="c-primary">{{ exercise.name }}</RouterLink>
          </NListItem>
        </NList>
      </NCard>
    </NCard>
  </div>
</template>
