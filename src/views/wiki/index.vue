<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useEdLinux } from '@/hooks/common/edlinux';

const { pb } = useEdLinux();
const wikis = ref();
const initWikis = async () => {
  wikis.value = await pb.collection('wiki').getFullList();
};

onMounted(async () => {
  await Promise.all([initWikis()]);
});
</script>

<template>
  <div v-if="wikis">
    <NList bordered>
      <NListItem v-for="wiki in wikis" :key="wiki.id">
        <NButton tag="a" :href="wiki.content" text>{{ wiki.name }}</NButton>
      </NListItem>
    </NList>
  </div>
</template>

<style scoped></style>
