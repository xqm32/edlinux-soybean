import { computed, reactive, ref } from 'vue';
import { defineStore } from 'pinia';
import { useLoading } from '@sa/hooks';
import { SetupStoreId } from '@/enum';
import { useRouterPush } from '@/hooks/common/router';
import { localStg } from '@/utils/storage';
import { $t } from '@/locales';
import { useRouteStore } from '../route';
import { usePocketBase } from '../pb';
import { clearAuthStorage, getToken, getUserInfo } from './shared';

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const routeStore = useRouteStore();
  const { route, toLogin, redirectFromLogin } = useRouterPush(false);
  const { loading: loginLoading, startLoading, endLoading } = useLoading();
  const pb = usePocketBase();

  const token = ref(getToken());

  const userInfo: Api.Auth.UserInfo = reactive(getUserInfo());

  /** is super role in static route */
  const isStaticSuper = computed(() => {
    const { VITE_AUTH_ROUTE_MODE, VITE_STATIC_SUPER_ROLE } = import.meta.env;

    return VITE_AUTH_ROUTE_MODE === 'static' && userInfo.roles.includes(VITE_STATIC_SUPER_ROLE);
  });

  /** Is login */
  const isLogin = computed(() => Boolean(token.value));

  /** Reset auth store */
  async function resetStore() {
    const authStore = useAuthStore();

    clearAuthStorage();

    authStore.$reset();

    if (!route.value.meta.constant) {
      await toLogin();
    }

    routeStore.resetStore();
  }

  /**
   * Login
   *
   * @param userName User name
   * @param password Password
   * @param [redirect=true] Whether to redirect after login. Default is `true`
   */
  async function login(userName: string, password: string, redirect = true) {
    startLoading();

    let error = false;
    try {
      await pb.collection('users').authWithPassword(userName, password);
    } catch (e: any) {
      window.$message?.error?.('用户名或密码错误');
      error = true;
    }

    if (!error) {
      await logging();

      await routeStore.initAuthRoute();

      if (redirect) {
        await redirectFromLogin();
      }

      if (routeStore.isInitAuthRoute) {
        window.$notification?.success({
          title: $t('page.login.common.loginSuccess'),
          content: $t('page.login.common.welcomeBack', { userName: userInfo.userName }),
          duration: 4500
        });
      }
    } else {
      resetStore();
    }

    endLoading();
  }

  async function logging() {
    // 1. stored in the localStorage, the later requests need it in headers
    localStg.set('token', 'iamatoken');
    localStg.set('refreshToken', 'iamarefreshtoken');

    const model = pb.authStore.model!;
    const info: Api.Auth.UserInfo = {
      userId: model.id,
      userName: model.name,
      roles: model.roles,
      buttons: []
    };

    // 2. store user info
    localStg.set('userInfo', info);

    // 3. update store
    token.value = 'iamatoken';
    Object.assign(userInfo, info);
  }

  return {
    token,
    userInfo,
    isStaticSuper,
    isLogin,
    loginLoading,
    resetStore,
    login
  };
});
