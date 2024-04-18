<script lang="ts" setup>
import { ref, shallowRef } from 'vue';

const MONACO_EDITOR_OPTIONS = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true
};

const language = ref('c');
const code = ref('');

const tab = ref('测试用例');

const input = ref('');
const result = ref();

const editorRef = shallowRef();
const handleMount = (editor: any) => (editorRef.value = editor);

function clear() {
  input.value = '';
  result.value = '';
}

async function run() {
  const resp = await fetch(import.meta.env.VITE_COMPILER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      language: language.value,
      code: code.value,
      cases: [
        {
          input: input.value
        }
      ]
    })
  });
  tab.value = '测试结果';
  result.value = await resp.json();
}
</script>

<template>
  <NSplit direction="horizontal" :default-size="0.3">
    <template #1>
      <NCard class="h-full" size="small" :bordered="false">
        <NInput class="h-full" type="textarea" :bordered="false" placeholder="这里可以做一些笔记..." />
      </NCard>
    </template>
    <template #2>
      <NSplit direction="vertical" :default-size="0.7">
        <template #1>
          <NCard class="h-full" size="small" :bordered="false">
            <VueMonacoEditor
              v-model:value="code"
              v-model:language="language"
              :options="MONACO_EDITOR_OPTIONS"
              @mount="handleMount"
            />
          </NCard>
        </template>
        <template #2>
          <NCard class="h-full overflow-auto" size="small" :bordered="false">
            <NTabs v-model:value="tab">
              <NTabPane name="测试用例" size="small">
                <NInput v-model:value="input" type="textarea" />
                <NFlex justify="center" class="mt-1 w-full">
                  <NButton type="default" @click="clear">重置</NButton>
                  <NButton type="primary" @click="run">运行</NButton>
                </NFlex>
              </NTabPane>
              <NTabPane name="测试结果" size="small">
                <NFlex v-if="result?.stderr" vertical>
                  <NTag type="error">{{ result?.message }}</NTag>
                  <NCode :code="result?.stderr" class="border border-red rd p-1" />
                </NFlex>
                <NFlex v-else-if="result?.outputs !== undefined" vertical>
                  <NTag type="success">{{ result?.message }}</NTag>
                  <NCode v-if="result?.outputs.join()" :code="result?.outputs.join()" class="border rd p-1" />
                </NFlex>
                <NFlex v-else vertical>
                  <NTag type="warning">暂无结果</NTag>
                </NFlex>
              </NTabPane>
            </NTabs>
          </NCard>
        </template>
      </NSplit>
    </template>
  </NSplit>
</template>
