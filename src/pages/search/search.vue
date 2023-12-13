<template>
  <view>
    <view class="search-bar">
      <label class="search-label" for="search">
        <image class="search-icon" src="/static/images/icon_search.png"></image>
        <input id="search" class="search-input" type="text" placeholder="搜索关键字" placeholder-class="search-input-placeholder" @input="updateSearchWord" @confirm="confirmKeyword"/>
      </label>
      <view class="search-cancel" @tap="confirmKeyword">搜索</view>
    </view>
    <view class="search-box">
      <view class="search-titles">
        <view class="search-title">搜索历史</view>
        <view class="search-title-ctrl">
          <image class="delete-icon" src="/static/images/delddre.png" @tap="clearHistory"></image>
        </view>
      </view>
      
      <view v-if="searchHistorys.length > 0" class="search-items">
        <view v-for="(item, index) in searchHistorys" class="search-item" :key="index" @tap="goToProducts(item.keyword)">{{item.keyword}}</view>
      </view>
      <view v-if="searchHistorys.length == 0 && historyLoad" class="history-none">无搜索记录</view>
    </view>
  </view>
  
</template>
<script>
import moment from 'moment';
export default {
  data() {
    return {
      searchHistorys: [],
      searchWord: '',
      keyword: '',
      historyLoad: false
    }
  },
  onShow() {
    this.searchHistorys = uni.getStorageSync('searchHistorys') || [];
    this.historyLoad = true;
  },
  methods: {
    updateSearchWord(e) {
      this.searchWord = e.detail.value;
    },
    confirmKeyword(e) {
      this.keyword = this.searchWord;
      if(this.keyword && this.keyword !== '') {
        let searchHistorys = uni.getStorageSync('searchHistorys') || [];
        if(searchHistorys.length >= 20) {
          searchHistorys.splice(0, 1);
        }
        searchHistorys.unshift({
          time: moment(new Date()),
          keyword: this.keyword
        })
        uni.setStorageSync('searchHistorys', searchHistorys);
      }
      
      uni.navigateTo({
        url: `/pages/products/products?keyword=${this.keyword}`
      })
    },

    clearHistory() {
      uni.showModal({
        title: '提示',
        content: '是否确定清空搜索记录',
        success: res => {
          if(res.confirm) {
            uni.removeStorageSync('searchHistorys');
            this.searchHistorys = [];
          }
        }
      })
    },
    goToProducts(keyword) {
      uni.navigateTo({
        url: `/pages/products/products?keyword=${keyword}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import 'search.scss';
</style>