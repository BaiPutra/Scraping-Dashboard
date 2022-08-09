const puppeteer = require("puppeteer");
var mysql = require("mysql");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ite",
});

async function scrape() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("http://portal.jke.bri.co.id/ech_admin/home");

  await page.waitForSelector("input.form-control:nth-child(1)");
  await page.type("input.form-control:nth-child(1)", "admin_jkt2", {
    delay: 80,
  });
  await page.type("input.form-control:nth-child(2)", "password", { delay: 80 });
  await page.waitForTimeout(2000);
  await page.waitForSelector(".btn");
  await page.click(".btn");

  await page.goto("http://portal.jke.bri.co.id/ech_admin/reg_tta_his", {
    waitUntil: "networkidle2",
  });

  await page.waitForTimeout(3000);
  await page.waitForSelector("#ext-comp-1009");
  await page.type("#ext-comp-1009", "599", { delay: 100 });
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");

  let data_all = [];
  for (let i = 0; i < 200; i++) {
    await page.waitForTimeout(3000);
    await page.waitForSelector("#ext-gen60");
    await page.click("#ext-gen60");

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
    data_all.push(...data);
  }

  await browser.close();
  console.log(data_all);
  return data_all;
}

con.connect(async function (err) {
  if (err) throw err;
  console.log("Connected");

  var sql =
    "INSERT IGNORE INTO data_atm (tiketID, tid, bagian, lokasi, jenisMasalah, pemasang, entryTiket, updateTiket, status, eskalasi) VALUES ?";

  var sql2 = `
    DELETE FROM data_atm
    WHERE eskalasi NOT IN ('KANWIL BRI', 'VENDOR MESIN')
    OR jenisMasalah = '[TTA - OPEN]' OR status NOT IN ('DONE', 'DONE_TRX')
    `;

  var sql3 = `
    UPDATE data_atm t1 
    INNER JOIN jenisTiket t2 
      ON t1.jenisMasalah = t2.jenisMasalah
    SET t1.jenisMasalah = t2.jenisID
    `;

  var sql4 = `
    INSERT INTO tiket
    SELECT tiketID, d.tid, jenisMasalah, entryTiket, updateTiket, status, eskalasi, peruntukan
    FROM data_atm d JOIN perangkat p
    ON d.tid = p.tid
    WHERE NOT EXISTS (
        SELECT 1
        FROM tiket t
        WHERE t.tiketID = d.tiketID
    )`;

  var data = await scrape();
  console.log(data);

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

  con.query(sql4, function (err, res) {
    if (err) throw err;
    console.log({ res });
  });

  con.end();
});
