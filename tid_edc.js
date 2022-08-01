const puppeteer = require("puppeteer");
const ots = require("objects-to-csv");
const ObjectsToCsv = require("objects-to-csv");

var urlBase1 = "http://172.18.44.66/edcpro/index.php/detail/merchant/";
var urlBase2 = "?group_code=I";

async function getLinks() {
  const links = [];

  for (let i = 0; i < 106; i++) {
    let url = urlBase1 + [i * 50] + urlBase2;
    links.push(url);
  }

  console.log(links);
  return {
    links,
  };
}

async function getData(url, page) {
  await page.setDefaultNavigationTimeout(0);
  await page.goto(url, { waitUntil: "networkidle2" });

  let data = await page.evaluate(() => {
    let results = [];
    let items = document.querySelectorAll(".tabledata > tbody > tr");
    items.forEach((item) => {
      results.push([
        item.querySelector("td:nth-child(3)") &&
          item.querySelector("td:nth-child(3)").textContent, // tid
        item.querySelector("td:nth-child(4)") &&
          item.querySelector("td:nth-child(4)").textContent, // lokasi
        item.querySelector("td:nth-child(6)") &&
          item.querySelector("td:nth-child(6)").textContent, // jenis (chain, ..)
        item.querySelector("td:nth-child(8)") &&
          item.querySelector("td:nth-child(8)").textContent, // kanca
        item.querySelector("td:nth-child(10)") &&
          item.querySelector("td:nth-child(10)").textContent, // implementor
      ]);
    });
    // var selectResult = [];
    // for (let i = 1; i < 16; i++) {
    //   selectResult.push(results[i]);
    // }

    return results;
  });

  return {
    data,
  };
}

async function scrape() {
  var get_links = await getLinks();
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const dataEDC = [];

  for (let link of get_links.links) {
    var data_EDC = await getData(link, page);
    Array.prototype.push.apply(dataEDC, data_EDC.data);
  }

  const csv = new ObjectsToCsv(dataEDC);
  await csv.toDisk("tidEDC.csv");

  await browser.close();
  console.log(dataEDC);
  // return dataEDC;
}

scrape();
