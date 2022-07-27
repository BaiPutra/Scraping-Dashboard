const puppeteer = require("puppeteer");
var mysql = require("mysql");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "scraping",
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

  let data_all = [];
  for (let i = 0; i < 10; i++) {
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
          item.querySelector("td:nth-child(1)").textContent, // ticketID
          item.querySelector("td:nth-child(5)").textContent, // tid
          item.querySelector("td:nth-child(6)").textContent, // bagian
          item.querySelector("td:nth-child(10)").textContent, // lokasi
          item.querySelector("td:nth-child(7)").textContent, // jenis masalah
          item.querySelector("td:nth-child(12)").textContent, // pemasang
          item.querySelector("td:nth-child(4)").textContent, // entry ticket
          item.querySelector("td:nth-child(22)").textContent, // update ticket
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
    "INSERT INTO data_ATM_CRM (ticketID, tid, bagian, lokasi, jenisMasalah, pemasang, entryTicket, updateTicket, status, eskalasi) VALUES ?";

  var sql2 = `
    DELETE FROM data_atm_crm 
    WHERE eskalasi IN ('E-CHANNEL', 'BRISAT', 'JARINGAN', 'DIVISI OPT') 
    OR jenisMasalah = '[TTA - OPEN]' OR status IN ('CANCEL', 'CANCEL_MA') 
    OR id IN(
      SELECT id FROM (SELECT id, ROW_NUMBER() 
        OVER(PARTITION BY ticketID ORDER BY ticketID) AS row_num 
      FROM data_atm_crm) AS temp_table WHERE row_num > 1 
    )`;

  var sql3 = `
    UPDATE data_atm_crm t1 
    INNER JOIN jenis_tiket t2 
      ON t1.jenisMasalah = t2.jenis_masalah
    INNER JOIN pemasang t3
      ON t1.pemasang = t3.nama_pemasang
    SET t1.jenisMasalah = t2.id, t1.target_hari = t2.target_hari, t1.pemasang = t3.id
    `;

  var sql4 = `
    INSERT INTO tiket
    SELECT * FROM data_atm_crm AS d 
    WHERE NOT EXISTS ( 
      SELECT 1 
      FROM tiket AS t 
      WHERE t.ticketID = d.ticketID
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
