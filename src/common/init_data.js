/**
 * 只用来生成addressparse所需的area.js里的相关内容
 * 随便找个vue文件引用该文件即可从console里输出相关内容
 */

import provinceData from '../components/mpvue-citypicker/city-data/province';
import cityData from '../components/mpvue-citypicker/city-data/city';
import areaData from '../components/mpvue-citypicker/city-data/area';


let provinceArr = provinceData, provinces = [];
for(let i = 0; i < provinceArr.length; i++) {
  let item = provinceArr[i];
  provinces.push(`'${item.value}0000': '${item.label}'`); //补4个零
}
console.log('以下为province内容')
console.log(
  `{${provinces.join(',')}}`
)

let cityArr = [], cities = [];
// city层需要处理
for(let i = 0; i < cityData.length; i++) {
  cityArr.push(...cityData[i]);
}
for(let i = 0; i < cityArr.length; i++) {
  let item = cityArr[i];
  cities.push(`'${item.value}00': '${item.label}'`); //补2个零
}
console.log('以下为city内容')
console.log(
  `{${cities.join(',')}}`
)

let areaArr = [], areas = [];
// area层需要处理两层
for(let i = 0; i < areaData.length; i++) {
  for(let j = 0; j < areaData[i].length; j++) {
    areaArr.push(...areaData[i][j]);
  }
}
for(let i = 0; i < areaArr.length; i++) {
  let item = areaArr[i];
  areas.push(`'${item.value}': '${item.label}'`);
}
console.log('以下为area内容')
console.log(
  `{${areas.join(',')}}`
)
