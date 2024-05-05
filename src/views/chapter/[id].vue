<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import VuePdfEmbed from 'vue-pdf-embed';
import { usePocketBase } from '@/store/modules/pb';
import 'vue-pdf-embed/dist/style/index.css';
import 'vue-pdf-embed/dist/style/annotationLayer.css';
import 'vue-pdf-embed/dist/style/textLayer.css';

const props = defineProps<{ id: string }>();
const pb = usePocketBase();
const getFileUrl = (attachment: any) => pb.getFileUrl(attachment, attachment.content, { download: true });

const attachments = ref();
const initAttachments = async () => {
  attachments.value = await pb
    .collection('attachments')
    .getFullList({ filter: `chapterId="${props.id}"`, sort: 'created' });
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

onBeforeMount(async () => {
  await Promise.all([initChapter(), initAttachments(), initExercises()]);
});
</script>

<template>
  <div v-if="chapter">
    <NGrid :cols="10">
      <NGridItem :span="7">
        <NCard :title="chapter.name">
          <VuePdfEmbed
            annotation-layer
            text-layer
            :source="getFileUrl(chapter)"
            class="h-xl overflow-x-hidden overflow-y-scroll border"
          />
        </NCard>
      </NGridItem>
      <NGridItem :span="3">
        <NCard title="课程资源">
          <NButton text class="mb-2">
            <NTag type="primary" class="mr-2">课件</NTag>
            <a :href="getFileUrl(chapter)">{{ chapter.content }}</a>
          </NButton>
          <div v-if="attachments">
            <NButton v-for="attachment in attachments" :key="attachment.id" text class="mb-2">
              <NTag class="mr-2">附件</NTag>
              <a :href="getFileUrl(attachment)">{{ attachment.content }}</a>
            </NButton>
          </div>
          <div v-if="exercises">
            <NButton v-for="exercise in exercises" :key="exercise.id" text class="mb-2">
              <NTag type="success" class="mr-2">习题</NTag>
              <RouterLink :to="`/exercise/${exercise.id}`">{{ exercise.name }}</RouterLink>
            </NButton>
          </div>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>
