<template>
  <web-view 
    :src="pathUrl"
  ></web-view>
</template>
<script>

export default {
  data() {
    return {
      pathUrl: ''
    }
  },
  onLoad(options) {
    let redirectWebUrl = uni.getStorageSync('redirectWebUrl');
    if(!redirectWebUrl) {
      return uni.showModal({
        title: '提示',
        content: '进入途径有误，即将离开该页面',
        showCancel: false,
        success: res => {
          if(res.confirm) {
            uni.reLaunch({
              url: '/pages/index/index'
            });
          }
        }
      })
    }
    this.pathUrl = redirectWebUrl;
  },
  methods: {
    
  }
}
</script>