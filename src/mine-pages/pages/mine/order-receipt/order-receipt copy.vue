<template>
  <view class="uni-common-pb-withbtn">
    <view class="poster-page">
      <image class="poster" :src="posterUrl" mode="widthFix"></image>
      <canvas id="poster-canvas" canvas-id="poster-canvas" :style="'width: 710px; height: ' + posterHeight + 'px'"></canvas>
    </view>
    <view class="bottom-btns">
      <view class="bottom-btn save-btn" @tap="saveImage">
        <view>保存图片</view>
      </view>
    </view>
  </view>

</template>

<script>
export default {
  data() {
    return {
      couldSave: false, //是否可以保存
      
      posterUrl: '',

      receipt: {},
      bg: {
        path: null,
        left: 0,
        top: 0,
        width: 710,
        height: 207
      },
      sign: {
        path: null,
        left: 445,
        top: 340,
        width: 240,
        height: 102
      },
      posterHeight: 656,  //除去sku的画布高度
      skuContentHeight: 257 //每个sku的容器高度
    }
  },
  onLoad(options) {
    let receipt = uni.getStorageSync('receipt');
    this.receipt = receipt;
    this.posterHeight += (receipt.goods.length || 0) * this.skuContentHeight;
    uni.showLoading({title: '生成专属图中'});

    this.tryDrawPoster();

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
  methods: {
    tryDrawPoster() {
      Promise.all([this.getGoodsImgs(), this.getPosterBg(), this.getSign()]).then(() => {
        return this.drawPoster();
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
        filePath: that.posterUrl,
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

    getGoodsImgs() {
      let that = this;
      let promise = new Promise( (resolve, reject) => {
        let count = 0;
        if(this.receipt.goods.length == 0) resolve();
        for(let i = 0; i < this.receipt.goods.length; i++) {
          uni.getImageInfo({
            src: this.receipt.goods[i].images,
            success: res => {
              that.receipt.goods[i].path = res.path;
              count += 1;
              if(count == this.receipt.goods.length) resolve();
            },
            fail: function (res) {
              reject();
            }
          })
        }
        
      })
      return promise;
      
    },
    getPosterBg() {
      let that = this;
      let promise = new Promise( (resolve, reject) => {
        that.bg.path = '/mine-pages/static/images/receipt/bg.png';
        resolve();
        // uni.getImageInfo({
        //   src: '../../static/images/receipt/bg.png',
        //   // src: 'https://img.manfei.andyoudao.cn/storage/uploads/20200901160416143622.png',
        //   success: res => {
        //     that.bg.path = res.path;
        //     resolve();
        //   },
        //   fail: function (res) {
        //     console.log(res);
        //     reject();
        //   }
        // })
      })
      return promise;
      
    },
    getSign() {
      let that = this;
      let promise = new Promise( (resolve, reject) => {
        that.sign.path = '/mine-pages/static/images/receipt/sign.png';
        resolve();
        // uni.getImageInfo({
        //   src: '../../static/images/receipt/sign.png',
        //   // src: 'https://img.manfei.andyoudao.cn/storage/uploads/20200901160444377857.png',
        //   success: res => {
        //     that.sign.path = res.path;
        //     resolve();
        //   },
        //   fail: function (res) {
        //     reject();
        //   }
        // })
      })
      return promise;
      
    },
    drawPoster() {
      let that = this;
      return new Promise( (resolve, reject) => {
        let ctx = uni.createCanvasContext('poster-canvas');
        ctx.clearRect(0, 0, 710, this.posterHeight);
        ctx.setFillStyle('#ffffff');
        ctx.fillRect(0, 0, 710, this.posterHeight);
        ctx.restore();

        ctx.font = 'normal 28px/1.4 "pingfangSC"';
        ctx.setFillStyle('#313131');  //设置全局绘画颜色为#313131
        ctx.setTextAlign('left');
        ctx.setTextBaseline('top');
        ctx.save();
        
        ctx.drawImage(that.bg.path, that.bg.left, that.bg.top, that.bg.width, that.bg.height);      //画顶部背景

        let fontSize = 28;    //字号大小变量
        let offsetTop = 0;    //垂直偏移量
        let offsetLeft = 0;   //水平偏移量
        // 画顶部背景的内容
        fontSize = 38;
        ctx.font = `500 ${fontSize}px/1.4 "pingfangSC"`;
        ctx.fillText('下单回执', 30,40);  //画标题
        ctx.restore();

        fontSize = 24;
        ctx.font = `normal ${fontSize}px/1.4 "pingfangSC"`;
        ctx.fillText(`订单单号：${that.receipt.order_sn}`, 30,103);  //画订单单号
        ctx.restore();

        fontSize = 24;
        ctx.setFontSize(fontSize);
        ctx.fillText(`下单时间：${that.receipt.pay_time}`, 30,142); //画订单时间
        ctx.restore();

        // 收货人信息
        fontSize = 30;
        ctx.font = `500 ${fontSize}px/1.4 "pingfangSC"`;
        ctx.fillText('收货人：', 50,247); //画收货人
        offsetLeft = ctx.measureText('收货人：').width;
        ctx.restore();

        fontSize = 28;
        ctx.font = `normal ${fontSize}px/1.4 "pingfangSC"`;
        let shipName = this.receipt.shipping_name.substring(0, 1) + '**';
        let shipPhone = this.receipt.shipping_phone.substr(0,3) + "****" + this.receipt.shipping_phone.substr(7);
        ctx.fillText(`${shipName}　${shipPhone}`, 50 + offsetLeft + 15,249); //画收货人信息
        ctx.restore();

        fontSize = 30;
        ctx.font = `500 ${fontSize}px/1.4 "pingfangSC"`;
        ctx.fillText('地　址：', 50,314); //画收货地址
        offsetLeft = ctx.measureText('地　址：').width;
        ctx.restore();

        fontSize = 28;
        ctx.font = `normal ${fontSize}px/1.4 "pingfangSC"`;
        let shipAddress = this.receipt.shipping_address.substring(0, 9) + '******';
        ctx.fillText(`${shipAddress}`, 50 + offsetLeft + 15,316); //画收货地址信息
        ctx.restore();

        // 画一条边框
        ctx.setFillStyle('#eeeeee');  //设置边框色
        ctx.fillRect(0, 386, 710, 2);
        ctx.restore();

        // 设置sku列表容器的起始垂直位置
        fontSize = 28;
        let totalPrice = 0; //原价总价
        let totalFare = 0;  //原总运费
        let skuOffsetTop = 386 + 2;
        for(let i = 0; i < this.receipt.goods.length; i++) {
          // 重置样式
          ctx.font = `normal ${fontSize}px/1.4 "pingfangSC"`;
          ctx.setTextAlign('left');
          ctx.setFillStyle('#313131');  //还原文本颜色为#313131

          let item = this.receipt.goods[i];
          let itemTop = skuOffsetTop + this.skuContentHeight * i + 40;  //当前sku偏移点为： 起始垂直位置 + i个sku容器高度 + 40上边距
          ctx.drawImage(item.path, 30, itemTop, 160, 160);
          ctx.restore();


          // 画标题，超出换行
          let currentRowWidth = 0, currentIndex = 0, currentRow = 1;  //当前行宽， 当前行的当前字索引， 当前行
          for (let j = 0; j < item.title.length; j++) {
            ctx.setFontSize(28);  //需要在这里设置字号，否则因为restore的原因下面获取字体宽度会拿错
            let currentWord = item.title[j];
            let currentWordWidth = ctx.measureText(currentWord).width;
            currentRowWidth += currentWordWidth;
            console.log('标题', j, currentWord, currentWordWidth, currentRowWidth);
            // 每行只能有400px宽度
            if(currentRowWidth > 400 || j == item.title.length - 1) {
              
              let endIndex = j; 
              if(currentIndex == endIndex || j == item.title.length - 1) {
                // j + 1 是因为substring不包括j，必须往上进位
                endIndex = j + 1;
              }
              let itemString = item.title.substring(currentIndex, endIndex);
              if(currentRow == 2) {
                // 在这场景，只允许最多两行。
                if(endIndex < item.title.length - 1) itemString = itemString.substring(0, itemString.length - 1) + '...';
              }
              
              ctx.setTextAlign('left');
              ctx.setFillStyle('#313131');  //还原文本颜色为#313131
              ctx.font = `normal 28px/1.4 "pingfangSC"`;
              // 文字位置计算公式： 起始点位置 + 1.4倍行高 * 字号大小 * 当前行索引
              console.log('画标题');
              ctx.fillText(itemString, 230, itemTop + 1.4 * fontSize * (currentRow - 1));


              // 重置当前行宽的初始值为第一个字的宽度
              currentRowWidth = currentWordWidth;
              currentIndex = endIndex;
              if(currentRow >= 2 || endIndex >= item.title.length) {
                break;
              } else {
                currentRow += 1;
              }
            }
          }
          ctx.restore();
          
          // 画属性规格
          currentRowWidth = 0, currentIndex = 0;  //当前行宽， 当前行的当前字索引
          for (let j = 0; j < item.attr.length; j++) {
            ctx.setFontSize(24);  //需要在这里设置字号，否则因为restore的原因下面获取字体宽度会拿错
            let currentWord = item.attr[j];
            let currentWordWidth = ctx.measureText(currentWord).width;
            currentRowWidth += currentWordWidth;
            console.log('规格', j, currentWord, currentWordWidth, currentRowWidth);
            // 每行只能有400px宽度
            if(currentRowWidth >= 480 || j == item.attr.length - 1) {
              
              let endIndex = j; 
              if(currentIndex == endIndex || j == item.attr.length - 1) {
                // j + 1 是因为substring不包括j，必须往上进位
                endIndex = j + 1;
              }
              let itemString = item.attr.substring(currentIndex, endIndex);
              if(endIndex < item.attr.length - 1) itemString = itemString.substring(0, itemString.length - 1) + '...';
              
              ctx.setTextAlign('left');
              ctx.setFillStyle('#313131');  //还原文本颜色为#313131
              ctx.font = `normal 24px/1.4 "pingfangSC"`;
              // 规格文字位置计算公式： 起始点位置 + 标题高度 + 10边距
              console.log('画规格');
              ctx.fillText(itemString, 230, itemTop + 1.4 * fontSize * currentRow + 10);
              break;  //只有一行
            }
          }
          
          ctx.restore();

          
          // 画价格
          ctx.font = `500 ${fontSize}px/1.4 "pingfangSC"`;
          ctx.setTextAlign('left');
          ctx.setFillStyle('#000000');
          //价格文字位置计算公式： 起始点位置 + 138
          ctx.fillText(`￥${item.price}`, 230, itemTop + 138);
          ctx.restore();
          console.log('画价格');


          // 画数量
          ctx.font = `normal 24px/1.4 "pingfangSC"`;
          ctx.setFillStyle('#313131');  //还原颜色
          ctx.setTextAlign('right');
          ctx.fillText(`×${item.count}`, 670, itemTop + 4); //右对齐，基准点在右方
          ctx.restore();
          console.log('画数量');

          // 画横线
          ctx.setFillStyle('#eeeeee');  //设置边框色
          if(i < this.receipt.goods.length - 1) {
            // 不是最后一个，短一点
            ctx.fillRect(20, skuOffsetTop + this.skuContentHeight * (i + 1) - 1, 670, 2); //左右20边距，共670宽，垂直位置为下一个容器的开始点
          } else {
            // 最后一个
            ctx.fillRect(0, skuOffsetTop + this.skuContentHeight * (i + 1) - 1, 710, 2); //无边距，710宽，垂直位置为下一个容器的开始点
          }
          ctx.restore();

          totalPrice += parseFloat(item.price) * item.count; //累进商品价格
          totalFare += parseFloat(item.fare); //累进运费费用

        }

        let realPrice = totalPrice + totalFare; //计算实际原费用
        
        fontSize = 28;
        ctx.font = `normal ${fontSize}px/1.4 "pingfangSC"`;
        ctx.setFillStyle('#313131');  //还原颜色
        ctx.setTextAlign('left');
        // 计算商品总价运费的起始位置
        let infoOffsetTop = skuOffsetTop + this.skuContentHeight * this.receipt.goods.length;

        ctx.font = `500 ${fontSize}px/1.4 "pingfangSC"`;
        ctx.setFillStyle('#313131');  //还原颜色
        ctx.setTextAlign('left');
        ctx.fillText('商品总价', 30, infoOffsetTop + 30); //画商品总价。根据偏移量算位置
        ctx.restore();

        
        ctx.font = `normal ${fontSize}px/1.4 "pingfangSC"`;
        ctx.setTextAlign('right');
        ctx.setFillStyle('#313131');  //还原颜色
        totalPrice = totalPrice.toFixed(2);
        ctx.fillText(`￥${totalPrice}`, 680, infoOffsetTop + 30); //画商品总价。根据偏移量算位置
        ctx.restore();

        ctx.font = `500 ${fontSize}px/1.4 "pingfangSC"`;
        ctx.setTextAlign('left');
        ctx.setFillStyle('#313131');  //还原颜色
        ctx.fillText('运费', 30, infoOffsetTop + 85); //画运费。根据偏移量算位置
        ctx.restore();

        ctx.font = `normal ${fontSize}px/1.4 "pingfangSC"`;
        ctx.setTextAlign('right');
        ctx.setFillStyle('#313131');  //还原颜色
        totalFare = totalFare.toFixed(2);
        ctx.fillText(`￥${totalFare}`, 680, infoOffsetTop + 85); //画运费值。根据偏移量算位置
        ctx.restore();

        ctx.setFillStyle('#eeeeee');  //设置边框色
        ctx.fillRect(20, infoOffsetTop + 145, 670, 2); //左右20边距，共670宽

        ctx.font = `500 ${fontSize}px/1.4 "pingfangSC"`;
        ctx.setFillStyle('#313131');  //还原颜色
        ctx.setTextAlign('left');
        ctx.fillText('合计', 30, infoOffsetTop + 175); //画运费。根据偏移量算位置
        ctx.restore();

        ctx.font = `500 ${fontSize}px/1.4 "pingfangSC"`;
        ctx.setFillStyle('#dd1f23');
        ctx.setTextAlign('right');
        realPrice = realPrice.toFixed(2);
        ctx.fillText(`￥${realPrice}`, 680, infoOffsetTop + 175); //画运费值。根据偏移量算位置
        ctx.restore();


        ctx.drawImage(that.sign.path, that.sign.left, that.sign.top, that.sign.width, that.sign.height);    //画印章
        
        ctx.draw(false, () => {
          uni.canvasToTempFilePath({
            canvasId: 'poster-canvas',
            fileType: 'jpg',
            success: function (res) {
              let poster = res.tempFilePath;
              that.posterUrl = poster;
              resolve();
            },
            fail: function (err) {
              reject();
            }
          })
        });

      })
      


    }
  }
}
</script>

<style lang="scss" scoped>
  @import './order-receipt.scss';
</style>