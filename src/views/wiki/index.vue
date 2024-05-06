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
    <NGrid :cols="10">
      <NGridItem :span="7">
        <NCard title="知识库">
          <div v-for="wiki in wikis" :key="wiki.id">
            <NButton tag="a" :href="wiki.content" text>{{ wiki.name }}</NButton>
          </div>
        </NCard>
      </NGridItem>
      <NGridItem :span="3"><NCard title="管理"></NCard></NGridItem>
    </NGrid>
  </div>
</template>

<style scoped></style>
