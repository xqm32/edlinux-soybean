<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { usePocketBase } from '@/store/modules/pb';

const props = defineProps<{
  id: string;
}>();
const pb = usePocketBase();

const chapter = ref();
onMounted(async () => {
  chapter.value = await pb.collection('chapters').getOne(props.id);
});
</script>

<template>
  <div>
    <NCard v-if="chapter" :title="chapter.name">
      <template #header-extra>
        {{ chapter.description }}
      </template>
    </NCard>
  </div>
</template>
