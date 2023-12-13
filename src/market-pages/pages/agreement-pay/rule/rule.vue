<template>
  <view class="rule-box">
    <mp-html :content="agreement_protocol" :lazy-load="true"/>
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
      agreement_protocol: '',
      type:'',
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    if(shareInfo.imageUrl) delete shareInfo.imageUrl;
    return shareInfo;
  },
  onLoad(options) {
    this.type=options.type
    this.getData();
  },
  methods: {
    getData() {
      let params = {
        from:'db',
        type: this.type //1基本信息，2大礼包入口图地址，3使用须知，4用户协议，5隐私政策， 6银行卡快捷支付用户协议 不传为全部返回
      }
      this.$get('/system/info', params, res => {
         if(this.type==6){
          let agreement_protocol = res.data.agreement_protocol;
           this.agreement_protocol = agreement_protocol.replace(/(<img[\s\S]+?)/ig, '<img style="display: block; margin: 0; padding: 0; width:100%; font-size: 0;"');  //正则给图片加样式;
         }else if(this.type==8){
           let agreement_zsk = res.data.agreement_zsk;
           this.agreement_protocol = agreement_zsk.replace(/(<img[\s\S]+?)/ig, '<img style="display: block; margin: 0; padding: 0; width:100%; font-size: 0;"');  //正则给图片加样式;
         }
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