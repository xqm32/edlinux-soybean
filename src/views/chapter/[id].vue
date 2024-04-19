<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { usePocketBase } from '@/store/modules/pb';

const props = defineProps<{
  id: string;
}>();
const pb = usePocketBase();

const attachments = ref();
const exercises = ref();
const chapter = ref();
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
      <NList v-if="attachments.length > 0" bordered>
        <NListItem v-for="attachment in attachments" :key="attachment.id">
          <NThing :title="attachment.content"></NThing>
          <a :href="pb.getFileUrl(attachment, attachment.content, { download: true })">下载</a>
        </NListItem>
      </NList>
    </NCard>
  </div>
</template>
