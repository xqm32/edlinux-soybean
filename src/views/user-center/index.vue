<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useEdLinux } from '@/hooks/common/edlinux';

const { pb, isStudent } = useEdLinux();
const getAvatarUrl = (model: any) => pb.getFileUrl(model, model.avatar, { download: true });

const userModel = ref();
async function updateUser() {
  await pb.collection('users').update(pb.authStore.model!.id, userModel.value);
  userModel.value = await pb.collection('users').getOne(pb.authStore.model!.id);
  window.$message!.success('修改成功');
}
async function updateUserAvatar({ file }: any) {
  await pb.collection('users').update(pb.authStore.model!.id, { avatar: file.file });
  userModel.value = await pb.collection('users').getOne(pb.authStore.model!.id);
}

onBeforeMount(async () => {
  userModel.value = await pb.collection('users').getOne(pb.authStore.model!.id);
});
</script>

<template>
  <div v-if="userModel">
    <NCard>
      <NForm class="w-sm">
        <NFormItem label="头像">
          <img :src="getAvatarUrl(userModel)" class="h-32" />
          <NUpload :show-file-list="false" :custom-request="updateUserAvatar">
            <NButton class="ml-4">上传头像</NButton>
          </NUpload>
        </NFormItem>
        <NFormItem label="姓名">
          <NInput v-model:value="userModel.name" />
        </NFormItem>
        <NFormItem label="学号/工号">
          <NInput v-model:value="userModel.number" />
        </NFormItem>
        <NFormItem v-if="isStudent" label="班级">
          <NInput v-model:value="userModel.class" />
        </NFormItem>
        <NButton @click="updateUser">修改</NButton>
      </NForm>
    </NCard>
  </div>
</template>

<style scoped></style>
