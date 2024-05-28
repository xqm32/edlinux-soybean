<script setup lang="ts">
import { computed } from 'vue';
import { createReusableTemplate } from '@vueuse/core';
import { useEdLinux } from '@/hooks/common/edlinux';

defineOptions({
  name: 'CardData'
});

interface CardData {
  key: string;
  title: string;
  value: number;
  unit: string;
  color: {
    start: string;
    end: string;
  };
  icon: string;
}

const { isTeacher } = useEdLinux();
const cardData = computed<CardData[]>(() => [
  {
    key: 'visitCount',
    title: isTeacher ? '我的教学' : '我的课程',
    value: 1,
    unit: '',
    color: {
      start: '#ec4786',
      end: '#b955a4'
    },
    icon: isTeacher ? 'mdi:work-outline' : 'mdi:school-outline'
  },
  {
    key: 'turnover',
    title: '所有课程',
    value: 4,
    unit: '',
    color: {
      start: '#865ec0',
      end: '#5144b4'
    },
    icon: 'mdi:library-shelves'
  },
  {
    key: 'downloadCoun',
    title: '教师人数',
    value: 2,
    unit: '',
    color: {
      start: '#56cdf3',
      end: '#719de3'
    },
    icon: 'mdi:account-tie'
  },
  {
    key: 'dealCount',
    title: '学生人数',
    value: 10,
    unit: '',
    color: {
      start: '#fcbc25',
      end: '#f68057'
    },
    icon: 'mdi:account-group'
  }
]);

interface GradientBgProps {
  gradientColor: string;
}

const [DefineGradientBg, GradientBg] = createReusableTemplate<GradientBgProps>();

function getGradientColor(color: CardData['color']) {
  return `linear-gradient(to bottom right, ${color.start}, ${color.end})`;
}
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <!-- define component start: GradientBg -->
    <DefineGradientBg v-slot="{ $slots, gradientColor }">
      <div class="rd-8px px-16px pb-4px pt-8px text-white" :style="{ backgroundImage: gradientColor }">
        <component :is="$slots.default" />
      </div>
    </DefineGradientBg>
    <!-- define component end: GradientBg -->

    <NGrid cols="s:1 m:2 l:4" responsive="screen" :x-gap="16" :y-gap="16">
      <NGi v-for="item in cardData" :key="item.key">
        <GradientBg :gradient-color="getGradientColor(item.color)" class="flex-1">
          <h3 class="text-16px">{{ item.title }}</h3>
          <div class="flex justify-between pt-12px">
            <SvgIcon :icon="item.icon" class="text-32px" />
            <CountTo
              :prefix="item.unit"
              :start-value="1"
              :end-value="item.value"
              class="text-30px text-white dark:text-dark"
            />
          </div>
        </GradientBg>
      </NGi>
    </NGrid>
  </NCard>
</template>

<style scoped></style>
