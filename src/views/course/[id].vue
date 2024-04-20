<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouterPush } from '@/hooks/common/router';
import { usePocketBase } from '@/store/modules/pb';

const props = defineProps<{
  id: string;
}>();

const pb = usePocketBase();
const { routerPush } = useRouterPush();

const active = ref(false);
function activate() {
  active.value = true;
}

const [chapters, course] = [ref(), ref()];
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
        <NButton v-if="pb.authStore.model!.roles.includes('R_STUDENT')" class="ml-2">加入课程</NButton>
        <div v-if="pb.authStore.model!.roles.includes('R_TEACHER')" class="ml-2">
          <NButton @click="activate">创建章节</NButton>
          <NDrawer v-model:show="active" default-width="33%" resizable placement="right">
            <NDrawerContent title="创建章节">
              <NForm>
                <NFormItem label="章节标题">
                  <NInput :value="course.name" />
                </NFormItem>
              </NForm>
              <NFlex justify="center"><NButton>创建</NButton></NFlex>
            </NDrawerContent>
          </NDrawer>
        </div>
      </template>
      <NList v-if="chapters.length > 0" bordered>
        <NListItem v-for="chapter in chapters" :key="chapter.id">
          <NThing :title="chapter.name"></NThing>
          <NButton @click="routerPush(`/chapter/${chapter.id}`)">进入章节</NButton>
        </NListItem>
      </NList>
      <NEmpty v-else />
    </NCard>
  </div>
</template>
