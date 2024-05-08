<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useEdLinux } from '@/hooks/common/edlinux';

const { pb } = useEdLinux();
const wikis = ref();
async function initWikis() {
  wikis.value = await pb.collection('wiki').getFullList();
}

onBeforeMount(async () => {
  await Promise.all([initWikis()]);
});
</script>

<template>
  <div v-if="wikis">
    <NCard title="知识库">
      <template #header-extra><NButton>编辑</NButton></template>
      <div v-for="wiki in wikis" :key="wiki.id">
        <NButton tag="a" :href="wiki.content" text>{{ wiki.name }}</NButton>
      </div>
    </NCard>
  </div>
</template>

<style scoped></style>
