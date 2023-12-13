<template>
  <view class="rule-box">
    <mp-html :content="systemInfos.rule" :lazy-load="true"/>
  </view>
</template>
<script>

import mpHtml from '@/components/mp-html/mp-html';
export default {
  component: {
    mpHtml
  },
  data() {
    return {
      systemInfos: {
        banner: '',
        rule: ''
      }
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    if(shareInfo.imageUrl) delete shareInfo.imageUrl;
    return shareInfo;
  },
  onLoad() {
    this.getData();
  },
  methods: {
    getData() {
      this.$get('/crowdFunding/config', null, res => {
        let systemInfos = res.data;
        if(systemInfos.rule && systemInfos.rule !== '') {
          systemInfos.rule = systemInfos.rule.replace(/(<img[\s\S]+?)/ig, '<img style="display: block; margin: 0; padding: 0; width:100%; font-size: 0;"');  //正则给图片加样式
        }
        this.systemInfos = systemInfos;
        console.log(this.systemInfos);
      })
    },

  }
}
</script>

<style lang="scss">
  page,
  .uni-page {
    background-color: #fff;
  }
  @import 'rule.scss';
</style>