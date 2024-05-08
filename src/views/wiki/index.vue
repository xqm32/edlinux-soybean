<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useActive, useEdLinux } from '@/hooks/common/edlinux';

const { pb, isTeacher } = useEdLinux();

const wikis = ref();
const wikiModel = ref({
  name: '',
  content: ''
});
const [active, activate] = useActive();
async function initWikis() {
  wikis.value = await pb.collection('wiki').getFullList();
}
async function createWiki() {
  await pb.collection('wiki').create(wikiModel.value);
  await initWikis();
  wikiModel.value = {
    name: '',
    content: ''
  };
  active.value = false;
  window.$message!.success('创建成功');
}
async function deleteWiki(id: string) {
  await pb.collection('wiki').delete(id);
  await initWikis();
  window.$message!.success('删除成功');
}

onBeforeMount(async () => {
  await Promise.all([initWikis()]);
});
</script>

<template>
  <div>
    <NCard title="知识库">
      <template #header-extra>
        <NButton @click="activate">添加文档</NButton>
        <NDrawer v-model:show="active" default-width="33%" resizable placement="right">
          <NDrawerContent title="添加">
            <NForm>
              <NFormItem label="名称">
                <NInput v-model:value="wikiModel.name" />
              </NFormItem>
              <NFormItem label="链接">
                <NInput v-model:value="wikiModel.content" />
              </NFormItem>
            </NForm>
            <NFlex justify="center"><NButton @click="createWiki">提交</NButton></NFlex>
          </NDrawerContent>
        </NDrawer>
      </template>
      <NGrid v-if="wikis" x-gap="8" :cols="5">
        <NGridItem v-for="wiki in wikis" :key="wiki.id">
          <NCard :title="wiki.name">
            <template #header-extra>
              <NPopconfirm v-if="isTeacher" @positive-click="deleteWiki(wiki.id)">
                <template #trigger><NButton type="error">删除</NButton></template>
                确认删除？
              </NPopconfirm>
            </template>
            <NButton tag="a" :href="wiki.content" text>进入学习</NButton>
          </NCard>
        </NGridItem>
      </NGrid>
    </NCard>
  </div>
</template>

<style scoped></style>
