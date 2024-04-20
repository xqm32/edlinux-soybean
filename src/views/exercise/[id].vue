<script lang="ts" setup>
import { onMounted, ref, shallowRef } from 'vue';
import { usePocketBase } from '@/store/modules/pb';
import { runCode } from '@/service/api';

const props = defineProps<{
  id: string;
}>();

const pb = usePocketBase();

const MONACO_EDITOR_OPTIONS = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true
};

const [language, code, tab, input, result] = [ref('c'), ref(''), ref('测试用例'), ref(''), ref()];
const exercise = ref();
const editorRef = shallowRef();
const handleMount = (editor: any) => (editorRef.value = editor);

function clear() {
  input.value = '';
  result.value = '';
}

async function run() {
  result.value = await runCode({
    language: language.value,
    code: code.value,
    cases: [
      {
        input: input.value
      }
    ]
  });
  tab.value = '测试结果';
}

async function submit() {
  result.value = await runCode({
    language: language.value,
    code: code.value,
    cases: JSON.parse(exercise.value.cases)
  });
  tab.value = '测试结果';
}

const active = ref(false);
function activate() {
  active.value = true;
}

onMounted(async () => {
  exercise.value = await pb.collection('exercises').getOne(props.id);
});
</script>

<template>
  <NSplit direction="horizontal" :default-size="0.3">
    <template #1>
      <NCard v-if="exercise" class="h-full" size="small" :bordered="false" :title="exercise.name">
        <template v-if="pb.authStore.model!.roles.includes('R_TEACHER')" #header-extra>
          <NButton @click="activate">编辑习题</NButton>
          <NDrawer v-model:show="active" default-width="33%" resizable placement="right">
            <NDrawerContent title="编辑习题">
              <NForm>
                <NFormItem label="题目名称">
                  <NInput :value="exercise.name" />
                </NFormItem>
                <NFormItem label="题目描述">
                  <NInput type="textarea" :value="exercise.content" />
                </NFormItem>
                <NFormItem label="测试用例（JSON格式）">
                  <NInput type="textarea" :value="exercise.cases" />
                </NFormItem>
                <NFormItem label="正确答案">
                  <NInput type="textarea" :value="exercise.answer" />
                </NFormItem>
              </NForm>
              <NFlex justify="center"><NButton>提交</NButton></NFlex>
            </NDrawerContent>
          </NDrawer>
        </template>
        <NCode :code="exercise.content" />
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
                  <NButton type="success" @click="submit">提交</NButton>
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
</template>
