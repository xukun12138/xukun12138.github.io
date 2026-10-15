(function (root, factory) {
  const formatter = factory();
  if (typeof module === "object" && module.exports) module.exports = formatter;
  if (root) root.VISITOR_LOCATION_FORMATTER = formatter;
})(typeof window !== "undefined" ? window : globalThis, function () {
  const PROVINCES = [
    ["北京", "Beijing", "BJ"], ["天津", "Tianjin", "TJ"], ["河北", "Hebei", "HE"],
    ["山西", "Shanxi", "SX"], ["内蒙古", "Inner Mongolia", "NM"], ["辽宁", "Liaoning", "LN"],
    ["吉林", "Jilin", "JL"], ["黑龙江", "Heilongjiang", "HL"], ["上海", "Shanghai", "SH"],
    ["江苏", "Jiangsu", "JS"], ["浙江", "Zhejiang", "ZJ"], ["安徽", "Anhui", "AH"],
    ["福建", "Fujian", "FJ"], ["江西", "Jiangxi", "JX"], ["山东", "Shandong", "SD"],
    ["河南", "Henan", "HA"], ["湖北", "Hubei", "HB"], ["湖南", "Hunan", "HN"],
    ["广东", "Guangdong", "GD"], ["广西", "Guangxi", "GX"], ["海南", "Hainan", "HI"],
    ["重庆", "Chongqing", "CQ"], ["四川", "Sichuan", "SC"], ["贵州", "Guizhou", "GZ"],
    ["云南", "Yunnan", "YN"], ["西藏", "Tibet", "XZ"], ["陕西", "Shaanxi", "SN"],
    ["甘肃", "Gansu", "GS"], ["青海", "Qinghai", "QH"], ["宁夏", "Ningxia", "NX"],
    ["新疆", "Xinjiang", "XJ"]
  ];

  const CITIES = [
    ["北京", "Beijing"], ["天津", "Tianjin"], ["石家庄", "Shijiazhuang"], ["唐山", "Tangshan"],
    ["太原", "Taiyuan"], ["呼和浩特", "Hohhot"], ["包头", "Baotou"], ["沈阳", "Shenyang"],
    ["大连", "Dalian"], ["长春", "Changchun"], ["哈尔滨", "Harbin"], ["上海", "Shanghai"],
    ["南京", "Nanjing"], ["苏州", "Suzhou"], ["无锡", "Wuxi"], ["常州", "Changzhou"],
    ["南通", "Nantong"], ["徐州", "Xuzhou"], ["扬州", "Yangzhou"], ["镇江", "Zhenjiang"],
    ["盐城", "Yancheng"], ["淮安", "Huai'an"], ["连云港", "Lianyungang"], ["宿迁", "Suqian"],
    ["泰州", "Taizhou"], ["杭州", "Hangzhou"], ["宁波", "Ningbo"], ["温州", "Wenzhou"],
    ["嘉兴", "Jiaxing"], ["绍兴", "Shaoxing"], ["金华", "Jinhua"], ["湖州", "Huzhou"],
    ["衢州", "Quzhou"], ["舟山", "Zhoushan"], ["丽水", "Lishui"], ["合肥", "Hefei"],
    ["芜湖", "Wuhu"], ["蚌埠", "Bengbu"], ["福州", "Fuzhou"], ["厦门", "Xiamen"],
    ["泉州", "Quanzhou"], ["南昌", "Nanchang"], ["济南", "Jinan"], ["青岛", "Qingdao"],
    ["烟台", "Yantai"], ["郑州", "Zhengzhou"], ["洛阳", "Luoyang"], ["武汉", "Wuhan"],
    ["宜昌", "Yichang"], ["长沙", "Changsha"], ["株洲", "Zhuzhou"], ["广州", "Guangzhou"],
    ["深圳", "Shenzhen"], ["东莞", "Dongguan"], ["佛山", "Foshan"], ["珠海", "Zhuhai"],
    ["惠州", "Huizhou"], ["中山", "Zhongshan"], ["汕头", "Shantou"], ["南宁", "Nanning"],
    ["桂林", "Guilin"], ["海口", "Haikou"], ["三亚", "Sanya"], ["重庆", "Chongqing"],
    ["成都", "Chengdu"], ["绵阳", "Mianyang"], ["贵阳", "Guiyang"], ["昆明", "Kunming"],
    ["拉萨", "Lhasa"], ["西安", "Xi'an"], ["兰州", "Lanzhou"], ["西宁", "Xining"],
    ["银川", "Yinchuan"], ["乌鲁木齐", "Urumqi"]
  ];

  const ORGANIZATIONS = [
    [/阿里云/u, "Alibaba Cloud"], [/腾讯云/u, "Tencent Cloud"], [/华为云/u, "Huawei Cloud"],
    [/百度云/u, "Baidu AI Cloud"], [/京东云/u, "JD Cloud"], [/天翼云/u, "China Telecom Cloud"],
    [/金山云/u, "Kingsoft Cloud"], [/火山引擎/u, "Volcano Engine"], [/世纪互联/u, "VNET"],
    [/网宿/u, "Wangsu Science & Technology"], [/教育网|CERNET/iu, "China Education and Research Network (CERNET)"],
    [/科技网|CSTNET/iu, "China Science and Technology Network (CSTNET)"], [/中国电信|电信/u, "China Telecom"],
    [/中国联通|联通/u, "China Unicom"], [/中国移动|移动/u, "China Mobile"],
    [/中国广电|广电/u, "China Broadnet"], [/铁通/u, "China Tietong"],
    [/鹏博士/u, "Dr. Peng Telecom"], [/长城宽带/u, "Great Wall Broadband"],
    [/东方有线/u, "Oriental Cable Network"], [/歌华有线/u, "Gehua Cable"],
    [/天威视讯/u, "Topway Video Communication"]
  ];

  const HAN_PATTERN = /[\u3400-\u9fff]/u;

  function clean(value) {
    return value == null ? "" : String(value).trim();
  }

  function administrativeKey(value) {
    return clean(value)
      .replace(/壮族自治区$|回族自治区$|维吾尔自治区$|自治区$|特别行政区$|地区$|自治州$|省$|市$|盟$/u, "")
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function findName(rows, value) {
    const key = administrativeKey(value);
    if (!key) return null;
    return rows.find((row) => row.some((name) => administrativeKey(name) === key)) || null;
  }

  function localizedCountry(location, language) {
    const code = clean(location.countryCode).toUpperCase();
    if (code === "CN" || ["中国", "china"].includes(clean(location.country).toLowerCase())) {
      return language === "zh" ? "中国" : "China";
    }
    if (code && typeof Intl.DisplayNames === "function") {
      try {
        return new Intl.DisplayNames([language === "zh" ? "zh-CN" : "en"], { type: "region" }).of(code) || code;
      } catch (error) {
        return clean(location.country) || code;
      }
    }
    return clean(location.country);
  }

  function localizedMainlandPlace(location, language) {
    const province = findName(PROVINCES, location.region);
    const city = findName(CITIES, location.city);
    const cityName = city
      ? city[language === "zh" ? 0 : 1]
      : HAN_PATTERN.test(clean(location.city)) && language !== "zh" ? "" : clean(location.city);
    const provinceName = province
      ? province[language === "zh" ? 0 : 1]
      : HAN_PATTERN.test(clean(location.region)) && language !== "zh" ? "" : clean(location.region);
    const countryName = language === "zh" ? "中国" : "China";
    const values = [];

    [cityName, provinceName, countryName].forEach((value) => {
      const key = administrativeKey(value);
      if (value && !values.some((item) => administrativeKey(item) === key)) values.push(value);
    });
    return values.join(language === "zh" ? "，" : ", ");
  }

  function localizedOrganization(value, language, mainland) {
    const organization = clean(value);
    if (!organization || language === "zh" || !HAN_PATTERN.test(organization)) return organization;
    const match = ORGANIZATIONS.find(([pattern]) => pattern.test(organization));
    if (match) return match[1];
    return mainland ? "Mainland China network provider" : "Network provider";
  }

  function format(location, language = "en") {
    const lang = language === "zh" ? "zh" : "en";
    const code = clean(location.countryCode).toUpperCase();
    const mainland = location.source === "mainland" || code === "CN" || ["中国", "china"].includes(clean(location.country).toLowerCase());
    const place = mainland
      ? localizedMainlandPlace(location, lang)
      : [location.city, location.region, localizedCountry(location, lang)].map(clean).filter(Boolean).join(", ");

    return {
      ip: clean(location.ip),
      place,
      org: localizedOrganization(location.org, lang, mainland),
      timezone: clean(location.timezone)
    };
  }

  return { format };
});
