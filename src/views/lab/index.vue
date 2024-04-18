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
  <NSplit direction="horizontal" :default-size="0.25">
    <template #1>
      <NCard class="h-full" size="small" :bordered="false">
        <NInput class="h-full" type="textarea" :bordered="false" placeholder="这里可以做一些笔记..." />
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
            <NTabs class="h-full" animated>
              <NTabPane name="测试用例" size="small">
                <NInput type="textarea" />
                <NFlex justify="center" class="mt-1 w-full">
                  <NButton type="default">重置</NButton>
                  <NButton type="primary">运行</NButton>
                </NFlex>
              </NTabPane>
              <NTabPane name="测试结果" size="small"><NCode /></NTabPane>
            </NTabs>
          </NCard>
        </template>
      </NSplit>
    </template>
  </NSplit>
</template>
