<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useEdLinux } from '@/hooks/common/edlinux';

defineOptions({
  name: 'HeaderBanner'
});

const appStore = useAppStore();
const { pb } = useEdLinux();

const user = ref();
const gap = computed(() => (appStore.isMobile ? 0 : 16));

onBeforeMount(async () => {
  user.value = await pb.collection('users').getOne(pb.authStore.model!.id);
});
</script>

<template>
  <NCard :bordered="false" class="card-wrapper">
    <NGrid :x-gap="gap" :y-gap="16" responsive="screen" item-responsive>
      <NGi span="24 s:24 m:18">
        <div v-if="user" class="flex-y-center">
          <div class="size-72px shrink-0 overflow-hidden rd-1/2">
            <img :src="pb.getFileUrl(user, user.avatar)" class="size-full" />
          </div>
          <div class="pl-12px">
            <h3 class="text-18px font-semibold">你好，{{ user.name }}！</h3>
          </div>
        </div>
      </NGi>
    </NGrid>
  </NCard>
</template>

<style scoped></style>
