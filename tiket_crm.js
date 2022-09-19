const puppeteer = require("puppeteer");
var mysql = require("mysql");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ite",
});

module.exports = function () {
  var url1 = "http://portal.jke.bri.co.id/ech_admin/reg_tta_his";
  var url2 = "http://portal.jke.bri.co.id/ech_admin/reg_tta";

  async function scrape() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto("http://portal.jke.bri.co.id/ech_admin/home");

    await page.waitForSelector("input.form-control:nth-child(1)");
    await page.type("input.form-control:nth-child(1)", "admin_jkt2", {
      delay: 80,
    });
    await page.type("input.form-control:nth-child(2)", "password", {
      delay: 80,
    });
    await page.waitForTimeout(2000);
    await page.waitForSelector(".btn");
    await page.click(".btn");

    await page.goto(url1);

    await page.waitForSelector("#ext-gen39");
    await page.click("#ext-gen39");
    // await page.waitForSelector("#ext-gen52");
    // await page.click("#ext-gen52");
    await page.click("div.x-combo-list-item:nth-child(2)");

    let tiket_selesai = [];
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(3000);
      await page.waitForSelector("#ext-gen60"); // history tiket
      await page.click("#ext-gen60");
      // await page.waitForSelector("#ext-gen73"); // active tiket
      // await page.click("#ext-gen73");

      let data = await page.evaluate(() => {
        let results = [];
        let items = document.querySelectorAll(
          "div.x-grid3-row > table > tbody > tr"
        );
        items.forEach((item) => {
          results.push([
            item.querySelector("td:nth-child(1)").textContent, // tiketID
            item.querySelector("td:nth-child(5)").textContent, // tid
            item.querySelector("td:nth-child(6)").textContent, // bagian
            item.querySelector("td:nth-child(10)").textContent, // lokasi
            item.querySelector("td:nth-child(7)").textContent, // jenis masalah
            item.querySelector("td:nth-child(12)").textContent, // pemasang
            item.querySelector("td:nth-child(4)").textContent, // entry tiket
            item.querySelector("td:nth-child(22)").textContent, // update tiket
            item.querySelector("td:nth-child(24)").textContent, // status
            item.querySelector("td:nth-child(23)").textContent, // eskalasi
          ]);
        });
        return results;
      });
      tiket_selesai.push(...data);
    }

    await page.goto(url2);

    await page.waitForSelector("#ext-gen52");
    await page.click("#ext-gen52");
    await page.click("div.x-combo-list-item:nth-child(2)");

    let tiket_pending = [];
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(3000);
      await page.waitForSelector("#ext-gen73");
      await page.click("#ext-gen73");

      let data = await page.evaluate(() => {
        let results = [];
        let items = document.querySelectorAll(
          "div.x-grid3-row > table > tbody > tr"
        );
        items.forEach((item) => {
          results.push([
            item.querySelector("td:nth-child(1)").textContent, // tiketID
            item.querySelector("td:nth-child(5)").textContent, // tid
            item.querySelector("td:nth-child(6)").textContent, // bagian
            item.querySelector("td:nth-child(10)").textContent, // lokasi
            item.querySelector("td:nth-child(7)").textContent, // jenis masalah
            item.querySelector("td:nth-child(12)").textContent, // pemasang
            item.querySelector("td:nth-child(4)").textContent, // entry tiket
            item.querySelector("td:nth-child(22)").textContent, // update tiket
            item.querySelector("td:nth-child(24)").textContent, // status
            item.querySelector("td:nth-child(23)").textContent, // eskalasi
          ]);
        });
        return results;
      });
      tiket_pending.push(...data);
    }

    await browser.close();
    // let data_filter = data_all.find(
    //   (data) => data[9] === "KANWIL BRI" || data[9] === "VENDOR MESIN"
    // );
    // console.log(data_filter);

    // console.log('tiket selesai', tiket_selesai);
    // console.log('tiket pending', tiket_pending);
    const all_tiket = tiket_pending.concat(tiket_selesai);
    // console.log(all_tiket);

    return all_tiket;
  }

  con.connect(async function (err) {
    if (err) throw err;
    console.log("Connected");

    var sql =
      "REPLACE INTO data_atm (tiketID, tid, bagian, lokasi, jenisMasalah, pemasang, entryTiket, updateTiket, status, eskalasi) VALUES ?";

    var sql2 = `
      DELETE FROM data_atm
      WHERE eskalasi NOT IN ('KANWIL BRI', 'VENDOR MESIN')
      OR jenisMasalah = '[TTA - OPEN]' OR status NOT IN ('DONE', 'DONE_TRX', 'PENDING')
      `;

    var sql3 = `
      UPDATE data_atm t1 
      INNER JOIN jenisTiket t2 
        ON t1.jenisMasalah = t2.jenisMasalah
      SET t1.jenisMasalah = t2.jenisID
      `;

    var sql4 = `
      REPLACE INTO tiket
      SELECT tiketID, d.tid, jenisMasalah, entryTiket, updateTiket, status, eskalasi
      FROM data_atm d JOIN perangkat p
      ON d.tid = p.tid
      WHERE NOT EXISTS (
          SELECT 1
          FROM tiket t
          WHERE t.tiketID = d.tiketID
      )`;

    var data = await scrape();
    // console.log(data);

    con.query(sql, [data], function (err) {
      if (err) throw err;
      console.log({ count: data.length });
    });

    con.query(sql2, function (err, res) {
      if (err) throw err;
      // console.log({ res });
    });

    con.query(sql3, function (err, res) {
      if (err) throw err;
      // console.log({ res });
    });

    con.query(sql4, function (err, res) {
      if (err) throw err;
      console.log({ res });
    });
    con.end();
  });
};
