// 获取数据封装，去掉页面中存在异步请求的问题
import { onMounted, ref } from 'vue';
import type { Ref } from 'vue';
import { useHttp } from '@crami/http';
import { commonApi } from '@/api/commonApi/index';
import { isUndefined } from 'lodash';
import { message } from '@crami/ui';
const _url = commonApi().system.getGetOnePageGridDataList.url;
type queryDataCall = [
  any,
  {
    query: (queryParams?: Record<string, any>) => any;
    [key: string]: any;
  },
  Ref<boolean>,
];
/**
 * @param options 请求参数
 *      @param params 请求接口的详细参数
 *      @param url  请求url
 *      @param method  请求方式
 * @param immediately  是否立即执行 默认true
 * @param beforeRequest 请求接口之前 ：可以对参数做一下处理
 * @param afterRequest  请求接口之后 ：可以对返回结果做一下处理
 */
type useQueryDataParam = {
  options: {
    params?: Record<string, any>;
    url?: string;
    method?: 'post' | 'get';
  };
  immediately?: boolean;
  beforeRequest?: (params: any) => any;
  afterRequest?: (res: any) => any;
};
// 获取异步请求数据
export function useQueryData(params: useQueryDataParam): queryDataCall {
  // 初始化默认值
  params.immediately = isUndefined(params.immediately) ? true : params.immediately;
  const data = ref();
  const loading = ref(false);
  const query = (queryParams = {}) => {
    loading.value = true;
    // 对请求参数做自定义处理
    if (params.beforeRequest) {
      queryParams = params.beforeRequest(queryParams);
    }
    return new Promise((resolve, reject) => {
      useHttp({
        url: params.options.url ?? _url,
        method: params.options.method ?? commonApi().system.getGetOnePageGridDataList.method,
        params: {
          ...commonApi().system.getGetOnePageGridDataList.params,
          ...params?.options.params,
          ...queryParams,
        },
      })
        .then(res => {
          // 对请求结果做自定义处理
          if (params.afterRequest) {
            res.data = params.afterRequest(res);
          }
          data.value = res.data;
          if (res.code === 200) {
            resolve(res);
          } else {
            message.error(res.msg);
            reject(res);
          }
        })
        .catch(err => {
          reject(err);
        })
        .finally(() => {
          loading.value = false;
        });
    });
  };
  const methods = {
    query,
  };
  onMounted(() => {
    if (params.immediately) {
      query();
    }
  });
  return [data, methods, loading];
}
