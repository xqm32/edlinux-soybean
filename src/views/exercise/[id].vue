<script lang="ts" setup>
import { onBeforeMount, ref, shallowRef } from 'vue';
import { runCode } from '@/service/api';
import { useActive, useEdLinux } from '@/hooks/common/edlinux';
import { useRouterPush } from '@/hooks/common/router';

const { pb, isTeacher } = useEdLinux();
const { routerPush } = useRouterPush();
const props = defineProps<{ id: string }>();
const MONACO_EDITOR_OPTIONS = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true
};
const editorRef = shallowRef();
function handleMount(editor: any) {
  editorRef.value = editor;
}

const input = ref('');
const result = ref();
function clear() {
  input.value = '';
  result.value = undefined;
}

const language = ref('c');
const code = ref('');
const tab = ref('测试用例');
async function run() {
  result.value = await runCode({
    language: language.value,
    code: code.value,
    cases: [{ input: input.value }]
  });
  tab.value = '测试结果';
}

const records = ref();
async function initRecords() {
  records.value = await pb
    .collection('records')
    .getFullList({ filter: `exerciseId="${props.id}" && studentId="${pb.authStore.model!.id}"` });
}

const exercise = ref();
const exerciseModel = ref({
  name: '',
  content: '',
  cases: '',
  answer: ''
});
async function initExercise() {
  exercise.value = await pb.collection('exercises').getOne(props.id);
  exerciseModel.value = { ...exercise.value };
}
async function submit() {
  result.value = await runCode({
    language: language.value,
    code: code.value,
    cases: JSON.parse(exercise.value.cases)
  });
  tab.value = '测试结果';
  if (records.value.length === 0 && result.value.code === 'AC') {
    await pb.collection('records').create({
      exerciseId: props.id,
      studentId: pb.authStore.model!.id,
      code: code.value
    });
    await initRecords();
  }
}

const [active, activate] = useActive();
async function updateExercise() {
  await pb.collection('exercises').update(props.id, exerciseModel.value);
  await initExercise();
  active.value = false;
  window.$message!.success('更新成功');
}
async function deleteExercise() {
  await pb.collection('exercises').delete(props.id);
  window.$message!.success('删除成功');
  await routerPush(`/chapter/${exercise.value.chapterId}`);
}

onBeforeMount(async () => {
  await Promise.all([initExercise(), initRecords()]);
});
</script>

<template>
  <div>
    <NSplit direction="horizontal" :default-size="0.3">
      <template #1>
        <NCard v-if="exercise" class="h-full" size="small" :bordered="false" :title="exercise.name">
          <template #header-extra>
            <NTag v-if="records && records.length > 0" type="success">已完成</NTag>
            <NButton v-if="isTeacher" @click="activate">编辑习题</NButton>
            <NDrawer v-model:show="active" default-width="50%" resizable placement="right">
              <NDrawerContent title="编辑习题">
                <NForm>
                  <NFormItem label="题目名称">
                    <NInput v-model:value="exerciseModel.name" />
                  </NFormItem>
                  <NFormItem label="题目描述">
                    <NInput v-model:value="exerciseModel.content" type="textarea" class="font-mono" :rows="8" />
                  </NFormItem>
                  <NFormItem label="测试用例（JSON格式）">
                    <NInput v-model:value="exerciseModel.cases" type="textarea" class="font-mono" :rows="8" />
                  </NFormItem>
                  <NFormItem label="正确答案">
                    <NInput v-model:value="exerciseModel.answer" type="textarea" class="font-mono" :rows="8" />
                  </NFormItem>
                </NForm>
                <NFlex justify="center"><NButton @click="updateExercise">提交</NButton></NFlex>
              </NDrawerContent>
            </NDrawer>
            <NPopconfirm v-if="isTeacher" @positive-click="deleteExercise">
              <template #trigger><NButton type="error" class="ml-2">删除习题</NButton></template>
              确认删除习题？
            </NPopconfirm>
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
  </div>
</template>
