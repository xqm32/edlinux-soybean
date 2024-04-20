<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { usePocketBase } from '@/store/modules/pb';

const pb = usePocketBase();
const wikis = ref();

onMounted(async () => {
  wikis.value = await pb.collection('wiki').getFullList();
});
</script>

<template>
  <div>
    <NList v-if="wikis" bordered>
      <NListItem v-for="wiki in wikis" :key="wiki.id" vv-for="wiki in wikis">
        <NButton tag="a" :href="wikis.content" text>{{ wiki.name }}</NButton>
      </NListItem>
    </NList>
  </div>
</template>

<style scoped></style>
