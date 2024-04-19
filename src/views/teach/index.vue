<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouterPush } from '@/hooks/common/router';
import { usePocketBase } from '@/store/modules/pb';

const pb = usePocketBase();
const { routerPush } = useRouterPush();

const active = ref(false);
function activate() {
  active.value = true;
}

const courses = ref();
onMounted(async () => {
  courses.value = await pb.collection('courses').getFullList({ filter: `teacherId="${pb.authStore.model!.id}"` });
});
</script>

<template>
  <div v-if="courses">
    <NCard class="mb-2">
      <NFlex justify="center">
        <NButton @click="activate">创建课程</NButton>
        <NDrawer v-model:show="active" default-width="33%" resizable placement="right">
          <NDrawerContent title="创建课程">
            <NForm>
              <NFormItem label="课程标题">
                <NInput />
              </NFormItem>
            </NForm>
            <NFlex justify="center"><NButton>创建</NButton></NFlex>
          </NDrawerContent>
        </NDrawer>
      </NFlex>
    </NCard>
    <NGrid v-if="courses.length > 0" x-gap="12" :cols="4">
      <NGridItem v-for="course in courses" :key="course.id">
        <NCard :title="course.name">
          <NButton @click="routerPush(`/course/${course.id}`)">进入课程</NButton>
        </NCard>
      </NGridItem>
    </NGrid>
    <NEmpty v-else class="h-full" />
  </div>
</template>
