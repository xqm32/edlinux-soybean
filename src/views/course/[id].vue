<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { usePocketBase } from '@/store/modules/pb';

const props = defineProps<{
  id: string;
}>();
const pb = usePocketBase();

const course = ref();
onMounted(async () => {
  course.value = await pb.collection('courses').getOne(props.id);
});
</script>

<template>
  <div>
    <NCard v-if="course">{{ course.name }}</NCard>
  </div>
</template>
