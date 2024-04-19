<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouterPush } from '@/hooks/common/router';
import { usePocketBase } from '@/store/modules/pb';

const props = defineProps<{
  id: string;
}>();
const pb = usePocketBase();
const { routerPush } = useRouterPush();

const course = ref();
const chapters = ref();
onMounted(async () => {
  chapters.value = await pb.collection('chapters').getFullList({ filter: `courseId="${props.id}"`, sort: 'order' });
  course.value = await pb.collection('courses').getOne(props.id);
});
</script>

<template>
  <div>
    <NCard v-if="course" :title="course.name">
      <template #header-extra>
        {{ course.description }}
      </template>
      <NList v-if="chapters.length > 0" bordered>
        <NListItem v-for="chapter in chapters" :key="chapter.id">
          <NThing :title="chapter.name"></NThing>
          <NButton @click="routerPush(`/chapter/${chapter.id}`)">进入课程</NButton>
        </NListItem>
      </NList>
      <NEmpty v-else />
    </NCard>
  </div>
</template>
