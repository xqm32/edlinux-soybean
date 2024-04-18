<script lang="ts" setup>
import { ref, shallowRef } from 'vue';

const MONACO_EDITOR_OPTIONS = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true
};

const code = ref('');
const editorRef = shallowRef();
const handleMount = (editor: any) => (editorRef.value = editor);
</script>

<template>
  <NSplit direction="horizontal">
    <template #1>
      <NCard class="h-full" size="small" :bordered="false">
        <NCode />
      </NCard>
    </template>
    <template #2>
      <NSplit direction="vertical" :default-size="0.75">
        <template #1>
          <NCard class="h-full" size="small" :bordered="false">
            <VueMonacoEditor v-model:value="code" :options="MONACO_EDITOR_OPTIONS" @mount="handleMount" />
          </NCard>
        </template>
        <template #2>
          <NCard class="h-full" size="small" :bordered="false">
            <NTabs animated>
              <NTabPane name="测试用例"><NCode /></NTabPane>
              <NTabPane name="测试结果"><NCode /></NTabPane>
            </NTabs>
          </NCard>
        </template>
      </NSplit>
    </template>
  </NSplit>
</template>

<style scoped></style>
