<script setup lang="ts">
import { ref } from 'vue';
import { useEdLinux } from '@/hooks/common/edlinux';

const { pb } = useEdLinux();
const userModel = ref({
  name: pb.authStore.model!.name,
  number: pb.authStore.model!.number,
  class: pb.authStore.model!.class
});
async function updateUser() {
  await pb.collection('users').update(pb.authStore.model!.id, userModel.value);
  userModel.value = await pb.collection('users').getOne(pb.authStore.model!.id);
  window.$message!.success('修改成功');
}
</script>

<template>
  <div>
    <NCard>
      <NForm class="w-sm">
        <NFormItem label="姓名">
          <NInput v-model:value="userModel.name" />
        </NFormItem>
        <NFormItem label="学号/工号">
          <NInput v-model:value="userModel.number" />
        </NFormItem>
        <NFormItem label="班级">
          <NInput v-model:value="userModel.class" />
        </NFormItem>
        <NButton @click="updateUser">修改</NButton>
      </NForm>
    </NCard>
  </div>
</template>

<style scoped></style>
