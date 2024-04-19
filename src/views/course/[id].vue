<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { usePocketBase } from '@/store/modules/pb';

const props = defineProps<{
  id: string;
}>();
const pb = usePocketBase();

const course = ref();
const chapters = ref();
onMounted(async () => {
  chapters.value = await pb.collection('chapters').getFullList({ filter: `courseId="${props.id}"` });
  course.value = await pb.collection('courses').getOne(props.id);
});
</script>

<template>
  <div>
    <NCard v-if="course" :title="course.name">
      <template #header-extra>
        {{ course.description }}
      </template>
      <NList bordered>
        <NListItem v-for="chapter in chapters" :key="chapter.id">
          <NThing :title="chapter.name"></NThing>
        </NListItem>
      </NList>
    </NCard>
  </div>
</template>
