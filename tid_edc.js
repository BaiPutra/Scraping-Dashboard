const puppeteer = require("puppeteer");
var mysql = require("mysql");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ite",
});

module.exports = function () {
  var urlBase1 = "http://172.18.44.66/edcpro/index.php/detail/merchant/";
  var urlBase2 = "?group_code=I";

  async function getLinks() {
    const links = [];

    for (let i = 0; i < 1; i++) {
      let url = urlBase1 + [i * 50] + urlBase2;
      links.push(url);
    }

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
          item.querySelector("td:nth-child(8)") &&
            item.querySelector("td:nth-child(8)").textContent, // kanca
          item.querySelector("td:nth-child(10)") &&
            item.querySelector("td:nth-child(10)").textContent, // implementor
        ]);
      });

      return results;
    });

    let dataEDC = data.filter(
      (data) => data[1] !== null && data[2] !== null && data[3] !== null
    );
    // console.log(dataEDC);

    return {
      dataEDC,
    };
  }

  async function scrape() {
    var get_links = await getLinks();
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const dataEDC = [];

    for (let link of get_links.links) {
      var data_EDC = await getData(link, page);
      Array.prototype.push.apply(dataEDC, data_EDC.dataEDC);
    }

    await browser.close();
    console.log(dataEDC);
    return dataEDC;
  }

  con.connect(async function (err) {
    if (err) throw err;
    console.log("Connected");

    var sql =
      "REPLACE INTO tid_edc (tid, lokasi, kancaID, implementorID) VALUES ?";

    var sql2 = `
    UPDATE tid_edc t1 
	  INNER JOIN implementor t2 
		  ON t1.implementorID = t2.nama
    SET t1.kancaID = t2.implementorID, t1.implementorID = t2.implementorID, t1.bagian = 'EDC';
  `;

    var sql3 = `
    REPLACE INTO perangkat
    SELECT * FROM tid_edc
    `;

    var data = await scrape();

    con.query(sql, [data], function (err) {
      if (err) throw err;
      console.log({ count: data.length });
    });

    con.query(sql2, function (err, res) {
      if (err) throw err;
      console.log({ res });
    });

    con.query(sql3, function (err, res) {
      if (err) throw err;
      console.log({ res });
    });

    con.end();
  });
};
