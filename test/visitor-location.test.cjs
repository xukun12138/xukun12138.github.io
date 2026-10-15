const assert = require("node:assert/strict");
const test = require("node:test");

const formatter = require("../assets/js/visitor-location.js");

const mainlandLocation = {
  source: "mainland",
  ip: "123.123.123.123",
  city: "南京市",
  region: "江苏省",
  country: "中国",
  countryCode: "CN",
  org: "中国电信",
  timezone: "Asia/Shanghai"
};

test("formats mainland visitor details entirely in English", () => {
  assert.deepEqual(formatter.format(mainlandLocation, "en"), {
    ip: "123.123.123.123",
    place: "Nanjing, Jiangsu, China",
    org: "China Telecom",
    timezone: "Asia/Shanghai"
  });
});

test("keeps mainland visitor details in Chinese on the Chinese page", () => {
  assert.deepEqual(formatter.format(mainlandLocation, "zh"), {
    ip: "123.123.123.123",
    place: "南京，江苏，中国",
    org: "中国电信",
    timezone: "Asia/Shanghai"
  });
});

test("never leaks unknown Chinese labels into the English panel", () => {
  const result = formatter.format({
    ...mainlandLocation,
    city: "未知城市",
    region: "广西壮族自治区",
    org: "某本地网络服务商"
  }, "en");

  assert.equal(result.place, "Guangxi, China");
  assert.equal(result.org, "Mainland China network provider");
  assert.doesNotMatch(`${result.place} ${result.org}`, /[\u3400-\u9fff]/u);
});

test("localizes a country code without altering English city and region names", () => {
  const result = formatter.format({
    ip: "203.0.113.10",
    city: "Milan",
    region: "Lombardy",
    countryCode: "IT",
    org: "Example Network",
    timezone: "Europe/Rome"
  }, "en");

  assert.equal(result.place, "Milan, Lombardy, Italy");
  assert.equal(result.org, "Example Network");
});
