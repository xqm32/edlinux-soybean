<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useEdLinux } from '@/hooks/common/edlinux';

const { pb } = useEdLinux();
const user = ref();

onMounted(async () => {
  user.value = await pb.collection('users').getOne(pb.authStore.model!.id);
});
</script>

<template>
  <div>
    <NCard>
      <NForm class="w-sm">
        <NFormItem label="姓名">
          <NInput :value="pb.authStore.model!.name" />
        </NFormItem>
        <NFormItem label="学号/工号">
          <NInput :value="pb.authStore.model!.number" />
        </NFormItem>
        <NFormItem label="班级">
          <NInput :value="pb.authStore.model!.class" />
        </NFormItem>
        <NButton>修改</NButton>
      </NForm>
    </NCard>
  </div>
</template>

<style scoped></style>
