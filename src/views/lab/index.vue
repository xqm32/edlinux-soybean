<script lang="ts" setup>
import { ref, shallowRef } from 'vue';
import { runCode } from '@/service/api';

const editorRef = shallowRef();
const handleMount = (editor: any) => (editorRef.value = editor);
const MONACO_EDITOR_OPTIONS = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true
};

const input = ref('');
const result = ref();
const clear = () => {
  input.value = '';
  result.value = undefined;
};

const language = ref('c');
const code = ref('');
const tab = ref('测试用例');
const run = async () => {
  result.value = await runCode({
    language: language.value,
    code: code.value,
    cases: [{ input: input.value }]
  });
  tab.value = '测试结果';
};
</script>

<template>
  <div>
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
                    <NButton @click="clear">重置</NButton>
                    <NButton type="primary" @click="run">运行</NButton>
                  </NFlex>
                </NTabPane>
                <NTabPane name="测试结果" size="small">
                  <NFlex v-if="['CE', 'RE', 'WA'].includes(result?.code)" vertical>
                    <NTag type="error">{{ result?.message }}</NTag>
                    <NCode :code="result?.stderr" class="text-red" />
                  </NFlex>
                  <NFlex v-else-if="['AC'].includes(result?.code)" vertical>
                    <NTag type="success">{{ result?.message }}</NTag>
                  </NFlex>
                  <NFlex v-else-if="['TEST'].includes(result?.code)" vertical>
                    <NTag>{{ result?.message }}</NTag>
                    <NCode v-if="result?.outputs.join()" :code="result?.outputs.join()" />
                  </NFlex>
                  <NEmpty v-else />
                </NTabPane>
              </NTabs>
            </NCard>
          </template>
        </NSplit>
      </template>
    </NSplit>
  </div>
</template>
