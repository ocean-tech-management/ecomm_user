<template>
  <web-view 
    :src="'https://sign.linghuoxin.com/faindex?companyId=' + companyId + '&thirdId=' + userInfo.uid"
  ></web-view>
</template>
<script>
import config from '@/config';
export default {
  data() {
    return {
      companyId: config.kuaishangOptions.companyId,
      userInfo: uni.getStorageSync('userInfo')
    }
  },
  methods: {

  }
}
</script>