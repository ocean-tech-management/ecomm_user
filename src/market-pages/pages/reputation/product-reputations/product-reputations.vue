<template>
  <view class="flex-page">
    
    <!-- 页面内容 -->
    <view class="flex-page-content">
      <scroll-view scroll-y class="tab-page-scroll" @scrolltolower="getList">
        <!-- 口碑评论 -->
        <view class="reputations">
          <view v-for="(reputation, index) in reputations" class="reputation" :key="index">
            <image class="reputation-avatar" :src="reputation.user_avatarUrl"></image>
            <view class="reputation-infos">
              <view class="reputation-name">{{reputation.user_name}}</view>
              <view class="reputation-user-tag">{{reputation.user_tag}}</view>
              
              <view class="reputation-content" :class="{'reputation-content-all': reputation.showAll}">
                <rich-text class="reputation-rich-content" :nodes="reputation.content"></rich-text>
              </view>
              <view class="reputation-all-triger" @tap="toggleAllContent(index)">
                {{reputation.showAll ? '收起' : '查看全文'}}
              </view>
              <view class="reputation-images">
                <view v-for="(item, imgIndex) in reputation.images" class="reputation-image-box" :key="item.id">
                  <image class="reputation-image" :src="item.thumbnail" mode="aspectFit" webp lazy-load @tap="showReputationImg(index, imgIndex)"></image>
                </view>
              </view>

              <view class="reputation-ctrls">
                <view class="share-btn" @tap="tryCreatePoster(index)">
                  <image class="share-btn-icon" src="/static/images/btn_share_icon.png"></image>
                  <view>立即分享</view>
                </view>
              </view>

            </view>
          </view>
        </view>
        <view v-if="reputations.length == 0 && !reputationLoading" class="scroll-tips">暂无口碑评价哦</view>
        <view v-if="reputations.length > 0 && currentPage > pageTotal && !reputationLoading" class="scroll-tips">已经到底啦</view>
      </scroll-view>
      
    </view>
    

    <view class="poster-box">
      <canvas id="poster" canvas-id="poster" class="poster-canvas" type="2d" :style="'width: 750px; height: ' + canvasHeight + 'px;'"></canvas>
      <canvas id="poster-ios" canvas-id="poster-ios" class="poster-canvas" :style="'width: 750px; height: ' + canvasHeight + 'px;'"></canvas>
    </view>

    <view v-if="showPoster" class="poster-result-box">
      <view class="poster-result-mask"></view>
      <view class="poster-result-content">
        <view class="poster-img-box" :class="{'poster-img-box-sm': isShort}">
          <image class="poster-result-close" src="/static/images/product_poster_close.png" @tap="showPoster = false"></image>
          <image v-if="poster" class="poster-img" :src="poster" mode="widthFix"></image>
        </view>
        <view class="poster-ctrls">
          <!-- <button class="poster-ctrl" open-type="share">
            <image class="poster-ctrl-icon" src="/static/images/poster_wechat.png"></image>
            <view>微信</view>
          </button> -->
          <view class="poster-ctrl" @tap="saveImage">
            <image class="poster-ctrl-icon" src="/static/images/poster_download.png"></image>
            <view>保存图片</view>
          </view>
        </view>
      </view>
    </view>


  </view>
  
</template>

<script>
export default {
  data() {
    return {
      currentPage: 1,
      pageTotal: 1,

      sn: null,

      reputations: [],
      reputationLoading: false,

      canvas: null,
      canvasHeight: 837,
      canvasReputation: {},
      posterBar: null,
      platform: 'ios',

      poster: {},
      showPoster: false
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    if(!options.sn) {
      uni.showToast({
        title: '不要尝试啦，正在返回首页',
        icon: 'none',
        mask: true
      })
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/index/index'
        })
      }, 1500);
      return;
    }
    this.sn = options.sn;
    this.getList();

    // #ifdef MP-WEIXIN
    // 只有微信小程序分开手机系统渲染，因为有bug
    this.platform = uni.getStorageSync('systemInfo') ? uni.getStorageSync('systemInfo').platform : 'ios';
    // #endif
    // #ifndef MP-WEIXIN
    // 不是微信的都按ios方案处理，webgl方案
    this.platform = 'ios';
    // #endif
    
  },
  methods: {
    getList() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        page: this.currentPage,
        goods_sn: this.sn
      }
      this.reputationLoading = true;
      this.$get('/goods/reputation', params, res => {
        this.reputationLoading = false;
        this.currentPage += 1;
        if(res.data.list.length == 0) return;

        let data = res.data.list;
        for(let i = 0; i < data.length; i++) {
          data[i].showAll = false;
          data[i].content_origin = data[i].content;
          data[i].content = data[i].content.replace(/\n/g,"<br/>");
        }

        this.reputations.push(...data);
        this.pageTotal = res.data.pageTotal;

      })
    },
    toggleAllContent(index) {
      this.reputations[index].showAll = !this.reputations[index].showAll;
    },
    showReputationImg(index, imgIndex) {
      let urls = [];
      for(let i = 0; i < this.reputations[index].images.length; i++) {
        urls.push(this.reputations[index].images[i].image_url);
      }
      uni.previewImage({
        urls: urls,
        current: this.reputations[index].images[imgIndex].image_url,
        fail: err => {
          console.log(err);
        }
      });
    },
    tryCreatePoster(index) {
      this.canvasReputation = JSON.parse(JSON.stringify(this.reputations[index]));

      uni.showLoading({title: '生成分享图中'});
      const query = uni.createSelectorQuery()
      query.select('#poster')
      .fields({
            id: true,
            node: true,
            size: true
      })
      .exec(res => {
        if(this.platform != 'ios') {
          // 不是ios走canvas 2d
          this.canvas = res[0].node;
          // 如果获取不到就是有问题
          if(!this.canvas) {
            uni.hideLoading();
            return setTimeout(() => {
              uni.showToast({
                title: '生成失败请重试',
                mask: true,
                icon: 'none'
              })
            })
          }
          
        }
        
        Promise.all([ this.getQrcode(), this.getProductImage(), this.getReputationImages(), this.getPosterBar() ]).then(() => {
          return this.startRenderPoster();
        }).then(() => {
          uni.hideLoading();
        }).catch(err => {
          uni.hideLoading();
          console.log('err', err);
          setTimeout(() => {
            uni.showToast({
              title: '网络有问题请重试',
              mask: true,
              icon: 'none'
            })
          }, 200)
          
        });
      })
      

      // 获取小程序的授权，仅小程序有效
      // #ifdef MP
      uni.getSetting({
        success: res =>{
          let couldSave = false;
          couldSave = res.authSetting['scope.writePhotosAlbum'] == false ? false : true;
          this.couldSave = couldSave;
        }
      })
      // #endif
    },

    getProductImage() {
      let promise = new Promise( (resolve, reject) => {
        if(this.platform == 'ios') {
          uni.getImageInfo({
            src: this.canvasReputation.goods.main_image,
            success: image => {
              this.canvasReputation.productImg = image.path;
              resolve();
            },
            fail: err => {
              uni.showToast({
                title: '获取产品图失败',
                icon: 'none'
              })
              reject();
            }
          });
        } else {
          const img = this.canvas.createImage();//创建img对象
          img.onload = res => {
            this.canvasReputation.productImg = img;
            resolve();
          }
          img.onerror = err => {
            uni.showToast({
              title: '获取产品图失败',
              icon: 'none'
            })
            reject();
          }
          img.src = this.canvasReputation.goods.main_image;
        }

      })
      return promise;
    },
    
    getQrcode() {
      let promise = new Promise( (resolve, reject) => {
        if(this.qrCode) return resolve();
        // 获取二维码
        let content = this.canvasReputation.goods_sn;
        if(uni.getStorageSync('userInfo').uid) content += `&${uni.getStorageSync('userInfo').uid}`;
        let params = {
          page: 'pages/index/index',
          content: content,
          width: '233px',
          auto_color: false
        }
        this.$post('/home/wxCode', params, res => {
          if(this.platform == 'ios') {
            // ios
            uni.getImageInfo({
              src: res.data,
              success: image => {
                this.qrCode = image.path;
                resolve();
              },
              fail: err => {
                uni.showToast({
                  title: '获取二维码失败',
                  icon: 'none'
                })
                reject();
              }
            });
          } else {
            // 如果不是ios
            const img = this.canvas.createImage();//创建img对象
            img.onload = () => {
              this.qrCode = img;
              resolve();
            }
            img.onerror = err => {
              uni.showToast({
                title: '获取二维码失败',
                icon: 'none'
              })
              reject();
            }
            img.src = res.data;
          }
          
        
        }, err => {
          console.log(err);
          reject();
        })
      })
      return promise;
    },
    getReputationImages() {
      let promise = new Promise( (resolve, reject) => {
        let imgLen = this.canvasReputation.images.length > 4 ? 4 : this.canvasReputation.images.length;
        let imgLoadNums = 0; //已加载了几张图
        this.canvasReputation.reputationImages = [];
        if(!imgLen || imgLen.length == 0) return resolve();

        for(let i = 0; i < imgLen; i++) {
          this.canvasReputation[i] = {};
          if(this.platform == 'ios') {
            uni.getImageInfo({
              src: this.canvasReputation.images[i].image_url,
              success: image => {
                 this.canvasReputation.reputationImages[i] = image.path;
                imgLoadNums += 1;
                if(imgLoadNums == imgLen) resolve();
              },
              fail: err => {
                imgLoadNums += 1;
                console.log(i, err);
                if(imgLoadNums == imgLen) resolve();
              }
            });
          } else {
            const img = this.canvas.createImage();//创建img对象
            img.onload = res => {
              this.canvasReputation.reputationImages[i] = img;
              imgLoadNums += 1;
              if(imgLoadNums == imgLen) resolve();
            }
            img.onerror = err => {
              imgLoadNums += 1;
              if(imgLoadNums == imgLen) resolve();
            }
            img.src = this.canvasReputation.images[i].image_url;
          }

        }
        
      })
      return promise;
    },
    
    getPosterBar() {
      let promise = new Promise( (resolve, reject) => {
        if(this.posterBar) return resolve();
        if(this.platform == 'ios') {
          this.posterBar = '/static/images/poster_bar.png';
          resolve();
        } else {
          if(this.posterBar) return resolve();  //有就不再获取了
          const img = this.canvas.createImage();//创建img对象
          img.onload = () => {
            this.posterBar = img;
            resolve();
          }
          img.onerror = err => {
            uni.showToast({
              title: '获取底图失败',
              icon: 'none'
            })
            reject();
          }
          img.src = '/static/images/poster_bar.png';
        }
      })
      return promise;
    },
    
    startRenderPoster() {
      
      // 画图前的文案处理
      let ctx = uni.createCanvasContext('poster-ios');

      let content = `@${this.canvasReputation.user_name}：${this.canvasReputation.content_origin}`;
      let splitContent = [], firstSplitContent = content.split('\n');
      for(let i = 0; i < firstSplitContent.length; i++) {
        let currentContent = firstSplitContent[i];
        if(!currentContent || currentContent === '') {
          splitContent.push('');
          currentRow += 1;
        }
        
        let currentRowWidth = 0;  //当前行宽
        let currentIndex = 0, currentRow = 1;  // 当前行的当前字索引， 当前行
        for (let j = 0; j < currentContent.length; j++) {
          ctx.font = 'normal normal 300 28px/1.4 "PingFangSC"';
          ctx.setTextBaseline('top');
          

          let currentWord = currentContent[j];
          let currentWordWidth = ctx.measureText(currentWord).width;
          currentRowWidth += currentWordWidth;
          // 每行只能有670px宽度
          if(currentRowWidth > 670 || j == currentContent.length - 1) {
            
            let endIndex = j; 
            if(currentIndex == endIndex || j == currentContent.length - 1) {
              // j + 1 是因为substring不包括j，必须往上进位
              endIndex = j + 1;
            }
            let itemString = currentContent.substring(currentIndex, endIndex);
            
            splitContent.push(itemString || '');

            // 重置当前行宽的初始值为第一个字的宽度
            currentRowWidth = currentWordWidth;
            currentIndex = endIndex;
            currentRow += 1;
          }
        }
      }

      this.canvasReputation.splitContent = splitContent;

      // 更新canvas长宽
      let canvasHeight = 837;  //起始宽高
      canvasHeight += (323 + 24) * Math.ceil(this.canvasReputation.reputationImages.length / 2) + 28 * 1.4 * this.canvasReputation.splitContent.length;
      if(this.canvas) {
        this.canvas.width = 750;
        this.canvas.height = canvasHeight;
      }
      this.canvasHeight = canvasHeight;
      this.$nextTick(() => {
        if(this.platform == 'ios') {
          return this.startRenderPosterIOS();
        } else {
          return this.startRenderPosterNoIOS();
        }
      });
        
      
      
    },
    startRenderPosterIOS() {
      let that = this;

      let offsetTop = 0;  //起始偏移量，受口碑图片和文章高度影响

      let ctx = uni.createCanvasContext('poster-ios');
      ctx.setFillStyle('#ffffff');
      ctx.fillRect(0, 0, 750, this.canvasHeight);
      ctx.restore();

      ctx.font = 'normal normal 300 28px/1.4 "PingFangSC"';
      ctx.setTextBaseline('top');
      ctx.setFillStyle('#313131');
      ctx.save();

      
      // 画口碑的图片
      for(let i = 0; i < this.canvasReputation.reputationImages.length; i++) {
        let row = Math.floor(i / 2);
        let col = i % 2;
        // 行和列的存在意义是作为偏移量指标确定图片应该在哪里渲染
        ctx.drawImage( this.canvasReputation.reputationImages[i], 40 + (323 + 24) * col, 16 + 24 * (row + 1) + 323 * row , 323, 323);   //渲染产品图
        ctx.restore();
      }

      // 偏移量 ↑
      offsetTop += Math.ceil(this.canvasReputation.reputationImages.length / 2) * (323 + 24);

      
      // 根据偏移量开始画已经处理好行位置的文字
      for(let i = 0; i < this.canvasReputation.splitContent.length; i++) {
        ctx.font = 'normal normal 300 28px/1.4 "PingFangSC"';
        ctx.setFontSize(28);
        let itemString = this.canvasReputation.splitContent[i];

        if(i == 0) {
          // 第一行有昵称，要高亮
          let name = `@${this.canvasReputation.user_name}：`;
          itemString = this.canvasReputation.splitContent[i].substring(name.length, this.canvasReputation.splitContent[i].length);
          ctx.setFillStyle('#c3946d');
          ctx.fillText(name, 40, offsetTop + 66 + 1.4 * 28 * i);
          ctx.setFillStyle('#313131');
          // 要在x轴加上昵称那段的长度偏移量
          ctx.fillText(itemString, 40 + ctx.measureText(name).width, offsetTop + 66 + 1.4 * 28 * i);
        } else {
          // 文字位置计算公式： 偏移量位置 + 不动量位置 + 1.4倍行高 * 字号大小 * 当前行索引
          ctx.fillText(itemString, 40, offsetTop + 66 + 1.4 * 28 * i);
        }
        ctx.restore();
      }

      offsetTop += 66 + 1.4 * 28 * this.canvasReputation.splitContent.length;

      
      // 画一个方形底色
      ctx.setFillStyle('#f4f4f4');
      ctx.fillRect(40, offsetTop + 45, 670, 187);
      ctx.restore();

      // 画产品图
      ctx.drawImage( this.canvasReputation.productImg, 70 , offsetTop + 75 , 127, 127);   //渲染产品图
      ctx.restore();

      // 画产品名
      let title = this.canvasReputation.goods.title;
      // 超过换行，两行截断
      let currentRowWidth = 0;  //当前行宽
      let currentIndex = 0, currentRow = 1;  // 当前行的当前字索引， 当前行
      for (let i = 0; i < title.length; i++) {
        ctx.font = 'normal normal 400 28px/1.4 "PingFangSC"';
        ctx.setFillStyle('#313131');

        let currentWord = title[i];
        let currentWordWidth = ctx.measureText(currentWord).width;
        currentRowWidth += currentWordWidth;
        // 每行只能有458px宽度
        if(currentRowWidth > 458 || i == title.length - 1) {
          
          let endIndex = i; 
          if(currentIndex == endIndex || i == title.length - 1) {
            // i + 1 是因为substring不包括i，必须往上进位
            endIndex = i + 1;
          }
          let itemString = title.substring(currentIndex, endIndex);
          if(currentRow == 2) {
            // 在这场景，只允许最多两行。
            if(endIndex < title.length - 1) itemString = itemString.substring(0, itemString.length - 1) + '...';
          }
          
          // 文字位置计算公式： 偏移量位置 + 不动量位置 + 1.4倍行高 * 字号大小 * 当前行索引
          ctx.fillText(itemString, 222, offsetTop + 75 + 1.4 * 28 * (currentRow - 1));


          // 重置当前行宽的初始值为第一个字的宽度
          currentRowWidth = currentWordWidth;
          currentIndex = endIndex;
          if(currentRow >= 2 || endIndex >= title.length) {
            // 2行跳出
            break;
          } else {
            currentRow += 1;
          }
        }
      }
      ctx.restore();

      // 画产品价格
      ctx.font = 'normal normal 500 30px/1.4 "PingFangSC"';
      ctx.setFillStyle('#e3494c');
      ctx.fillText(`￥${this.canvasReputation.sale_price || '——'}`, 222, offsetTop + 160);
      ctx.restore();

      // 偏移量加上产品信息的高度
      offsetTop += 45 + 187;

      
      // 画推荐人
      ctx.font = 'normal 28px/1.4 "PingFangSC"';
      ctx.setFillStyle('#000');
      // 画人名，人名+' 向你推荐' 超出...
      let userName = uni.getStorageSync('userInfo').name || '不知名用户', userNameString = '';
      currentRowWidth = ctx.measureText(' 向你推荐').width;  //当前行宽度，默认带有几个字
      for (let i = 0; i < userName.length; i++) {
        let currentWord = userName[i];
        let currentWordWidth = ctx.measureText(currentWord).width;
        currentRowWidth += currentWordWidth;
        // 只能有670px宽度
        if(currentRowWidth > 670 || i == userName.length - 1) {
          
          let endIndex = i + 1; 
          userNameString = userName.substring(0, endIndex);
          if(endIndex < userName.length - 1) userNameString = userNameString.substring(0, userNameString.length - 1) + '...';
          break;
        }
      }
      let shareUserWidth = ctx.measureText(`${userNameString} 向你推荐`).width || 0; //获取推荐人信息行的宽度
      let shareUserLeft = (750 - shareUserWidth) / 2;   //获取推荐人信息行的起始坐标，居中
      ctx.fillText(`${userNameString} 向你推荐`, shareUserLeft, offsetTop + 50);
      ctx.restore();
      
      // 画二维码
      ctx.drawImage(this.qrCode, 279, offsetTop + 107, 192, 192);   //渲染二维码
      ctx.restore();

      // 画分享长按识别
      ctx.font = 'normal 32px/1.4 "PingFangSC"';
      ctx.setFillStyle('#9d9d9d');
      ctx.setTextAlign('center');
      ctx.fillText(`长按识别购买`, 375, offsetTop + 339);  //简单居中设置坐标为居中坐标就可以了
      ctx.restore();

      
      // 画底部黑条
      ctx.drawImage(this.posterBar, 0, this.canvasHeight - 142, 750, 142);   //渲染海报条
      ctx.restore();

      console.log(ctx);
      ctx.draw(false, () => {
        uni.canvasToTempFilePath({
          canvasId: 'poster-ios',
          fileType: 'jpg',
          success: res => {
            console.log(res);
            let poster = res.tempFilePath;
            this.poster = poster;
            this.showPoster = true;
          },
          fail: err => {
            console.log(err);
            setTimeout(() => {
              uni.showToast({
                title: '网络问题请重试',
                mask: true,
                icon: 'none'
              })
            }, 200)
          }
        })
      })
      
    },
    startRenderPosterNoIOS() {
      let offsetTop = 0;  //起始偏移量，受口碑图片和文章高度影响
      // 不是ios
      const query = uni.createSelectorQuery();
      query.select('#poster')
      .fields({
            id: true,
            node: true,
            size: true
      })
      .exec(res => {
        const ctx = this.canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 750, this.canvasHeight);
        ctx.restore();
        
        ctx.font = 'normal normal 300 28px/1.4 "PingFangSC"';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#313131';
        ctx.save();

        // 画口碑的图片
        for(let i = 0; i < this.canvasReputation.reputationImages.length; i++) {
          let row = Math.floor(i / 2);
          let col = i % 2;
          // 行和列的存在意义是作为偏移量指标确定图片应该在哪里渲染
          ctx.drawImage( this.canvasReputation.reputationImages[i], 40 + (323 + 24) * col, 16 + 24 * (row + 1) + 323 * row , 323, 323);   //渲染产品图
          ctx.restore();
        }

        // 偏移量 ↑
        offsetTop += Math.ceil(this.canvasReputation.reputationImages.length / 2) * (323 + 24);


        // 根据偏移量开始画已经处理好行位置的文字
        for(let i = 0; i < this.canvasReputation.splitContent.length; i++) {
          ctx.font = 'normal normal 300 28px/1.4 "PingFangSC"';
          let itemString = this.canvasReputation.splitContent[i];

          if(i == 0) {
            // 第一行有昵称，要高亮
            let name = `@${this.canvasReputation.user_name}：`;
            itemString = this.canvasReputation.splitContent[i].substring(name.length, this.canvasReputation.splitContent[i].length);
            ctx.fillStyle = '#c3946d';
            ctx.fillText(name, 40, offsetTop + 66 + 1.4 * 28 * i);
            ctx.fillStyle = '#313131';
            // 要在x轴加上昵称那段的长度偏移量
            ctx.fillText(itemString, 40 + ctx.measureText(name).width, offsetTop + 66 + 1.4 * 28 * i);
          } else {
            // 文字位置计算公式： 偏移量位置 + 不动量位置 + 1.4倍行高 * 字号大小 * 当前行索引
            ctx.fillText(itemString, 40, offsetTop + 66 + 1.4 * 28 * i);
          }
          ctx.restore();
        }

        offsetTop += 66 + 1.4 * 28 * this.canvasReputation.splitContent.length;

        // 画一个方形底色
        ctx.fillStyle = '#f4f4f4';
        ctx.fillRect(40, offsetTop + 45, 670, 187);
        ctx.restore();

        // 画产品图
        ctx.drawImage( this.canvasReputation.productImg, 70 , offsetTop + 75 , 127, 127);   //渲染产品图
        ctx.restore();

        // 画产品名
        let title = this.canvasReputation.goods.title;
        // 超过换行，两行截断
        let currentRowWidth = 0;  //当前行宽
        let currentIndex = 0, currentRow = 1;  // 当前行的当前字索引， 当前行
        for (let i = 0; i < title.length; i++) {
          ctx.font = 'normal normal 400 28px/1.4 "PingFangSC"';
          ctx.fillStyle = '#313131';

          let currentWord = title[i];
          let currentWordWidth = ctx.measureText(currentWord).width;
          currentRowWidth += currentWordWidth;
          // 每行只能有458px宽度
          if(currentRowWidth > 458 || i == title.length - 1) {
            
            let endIndex = i; 
            if(currentIndex == endIndex || i == title.length - 1) {
              // i + 1 是因为substring不包括i，必须往上进位
              endIndex = i + 1;
            }
            let itemString = title.substring(currentIndex, endIndex);
            if(currentRow == 2) {
              // 在这场景，只允许最多两行。
              if(endIndex < title.length - 1) itemString = itemString.substring(0, itemString.length - 1) + '...';
            }
            
            // 文字位置计算公式： 偏移量位置 + 不动量位置 + 1.4倍行高 * 字号大小 * 当前行索引
            ctx.fillText(itemString, 222, offsetTop + 75 + 1.4 * 28 * (currentRow - 1));


            // 重置当前行宽的初始值为第一个字的宽度
            currentRowWidth = currentWordWidth;
            currentIndex = endIndex;
            if(currentRow >= 2 || endIndex >= title.length) {
              // 2行跳出
              break;
            } else {
              currentRow += 1;
            }
          }
        }
        ctx.restore();

        // 画产品价格
        ctx.font = 'normal normal 500 30px/1.4 "PingFangSC"';
        ctx.fillStyle = '#e3494c';
        ctx.fillText(`￥${this.canvasReputation.sale_price || '——'}`, 222, offsetTop + 160);
        ctx.restore();

        // 偏移量加上产品信息的高度
        offsetTop += 45 + 187;

        
        // 画推荐人
        ctx.font = 'normal 28px/1.4 "PingFangSC"';
        ctx.fillStyle = '#000';
        // 画人名，人名+' 向你推荐' 超出...
        let userName = uni.getStorageSync('userInfo').name || '不知名用户', userNameString = '';
        currentRowWidth = ctx.measureText(' 向你推荐').width;  //当前行宽度，默认带有几个字
        for (let i = 0; i < userName.length; i++) {
          let currentWord = userName[i];
          let currentWordWidth = ctx.measureText(currentWord).width;
          currentRowWidth += currentWordWidth;
          // 只能有670px宽度
          if(currentRowWidth > 670 || i == userName.length - 1) {
            
            let endIndex = i + 1; 
            userNameString = userName.substring(0, endIndex);
            if(endIndex < userName.length - 1) userNameString = userNameString.substring(0, userNameString.length - 1) + '...';
            break;
          }
        }
        let shareUserWidth = ctx.measureText(`${userNameString} 向你推荐`).width || 0; //获取推荐人信息行的宽度
        let shareUserLeft = (750 - shareUserWidth) / 2;   //获取推荐人信息行的起始坐标，居中
        ctx.fillText(`${userNameString} 向你推荐`, shareUserLeft, offsetTop + 50);
        ctx.restore();
        
        // 画二维码
        ctx.drawImage(this.qrCode, 279, offsetTop + 107, 192, 192);   //渲染二维码
        ctx.restore();

        // 画分享长按识别
        ctx.font = 'normal 32px/1.4 "PingFangSC"';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#9d9d9d';
        ctx.fillText(`长按识别购买`, 375, offsetTop + 339);  //简单居中设置坐标为居中坐标就可以了
        ctx.restore();

        
        // 画底部黑条
        ctx.drawImage(this.posterBar, 0, this.canvasHeight - 142, 750, 142);   //渲染海报条
        ctx.restore();


        uni.canvasToTempFilePath({
          canvas: this.canvas,
          fileType: 'jpg',
          success: res => {
            
            let poster = res.tempFilePath;
            this.poster = poster;
            this.showPoster = true;
          },
          fail: err => {
            console.log(err);
            setTimeout(() => {
              uni.showToast({
                title: '网络问题请重试',
                mask: true,
                icon: 'none'
              })
            }, 200)
          }
        })
      })

    },

    
    saveImage: function () {
      // 小程序有效，保存图片
      // #ifdef MP
      let that = this;
      if(!that.couldSave) {
        uni.openSetting({
          success(settingdata) {
            if (settingdata.authSetting['scope.writePhotosAlbum']) {
              // 获取权限成功，给出再次点击图片保存到相册的提示。
              that.couldSave = true;
              uni.showToast({
                title: '授权成功请重试',
                icon: "success",
                mask: true
              })
            } else {
              // 获取权限失败，给出不给权限就无法正常使用的提示
              uni.showToast({
                title: '需要授权方可保存',
                icon: "none",
                mask: true
              })
            }
          }
        })
        return;
      }
      uni.saveImageToPhotosAlbum({
        filePath: that.poster,
        success: function (res) {
          uni.showToast({
            title: '保存成功',
            icon: "success",
            mask: true
          })
        },
        fail: function (res) {
          if(res.errMsg == 'saveImageToPhotosAlbum:fail auth deny') {
            that.couldSave = false;
          }
          uni.showToast({
            title: '保存失败，请重试',
            icon: "none",
            mask: true
          })
          
          console.log('fail', res)
        }
      })
      // #endif
    },

  }
}
</script>


<style lang="scss" scoped>
  @import 'product-reputations.scss';
</style>