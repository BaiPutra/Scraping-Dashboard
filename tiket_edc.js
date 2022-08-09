const puppeteer = require("puppeteer");
var mysql = require("mysql");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ite",
});

var urlBase1 = "http://mms.bri.co.id/index.php/maintenance/cm_report_new/";
var urlBase2 =
  "?id=&jenis=&user_entry=&mid=&sub_jenis=&tgl_sort=tgl_update&tid=&kanwil=I&tgl_awal=2022-01-01&tgl_akhir=2022-08-31&status=CLOSED&pemasang=&submit=Generate";

async function getLinks() {
  const links = [];

  for (let i = 0; i < 218; i++) {
    let url = urlBase1 + [i * 15] + urlBase2;
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
        item.querySelector("td:nth-child(1)") &&
          item.querySelector("td:nth-child(1)").textContent, // ticketID
        item.querySelector("td:nth-child(4)") &&
          item.querySelector("td:nth-child(4)").textContent, // tid
        item.querySelector("td:nth-child(2)") &&
          item.querySelector("td:nth-child(2)").textContent, // lokasi
        item.querySelector("td:nth-child(8)") &&
          item.querySelector("td:nth-child(8)").textContent, // jenis masalah
        item.querySelector("td:nth-child(11)") &&
          item.querySelector("td:nth-child(11)").textContent, // pemasang
        item.querySelector("td:nth-child(6)") &&
          item.querySelector("td:nth-child(6)").textContent, // entry ticket
        item.querySelector("td:nth-child(7)") &&
          item.querySelector("td:nth-child(7)").textContent, // update ticket
        item.querySelector("td:nth-child(9)") &&
          item.querySelector("td:nth-child(9)").textContent, // status
        item.querySelector("td:nth-child(10)") &&
          item.querySelector("td:nth-child(10)").textContent, // eskalasi
        item.querySelector("td:nth-child(5)") && item.querySelector("td:nth-child(5)").textContent, // peruntukan
      ]);
    });
    return results;
  });

  let dataEDC = data.filter((data) => data[1] !== null);
  console.log(dataEDC);

  return {
    dataEDC,
  };
}

async function scrape() {
  var get_links = await getLinks();
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const dataEDC = [];

  await page.goto("http://mms.bri.co.id/index.php/user/login");
  await page.waitForSelector("#cboxClose");
  await page.click("#cboxClose");
  await page.waitForSelector("#username");
  await page.type("#username", "00259061", { delay: 70 });
  await page.type("#password", "P@ssw0rdkomplek", { delay: 70 });
  await page.click("#loginBtn");

  for (let link of get_links.links) {
    var data_EDC = await getData(link, page);
    Array.prototype.push.apply(dataEDC, data_EDC.dataEDC);
  }

  await browser.close();
  // console.log(dataEDC);
  return dataEDC;
}

con.connect(async function (err) {
  if (err) throw err;
  console.log("Connected");

  var sql =
    "INSERT IGNORE INTO data_edc (tiketID, tid, lokasi, jenisMasalah, pemasang, entryTiket, updateTiket, status, eskalasi, peruntukan) VALUES ?";

  var sql2 = `
    UPDATE data_edc t1 
	  INNER JOIN jenisTiket t2 
		  ON t1.jenisMasalah = t2.jenisMasalah
    SET t1.jenisMasalah = t2.jenisID;
  `;

  var sql3 = `
    INSERT INTO tiket
    SELECT tiketID, d.tid, d.jenisMasalah, entryTiket, updateTiket, status, eskalasi, peruntukan
    FROM data_edc d JOIN perangkat p
    ON d.tid = p.tid
    JOIN jenistiket j
    ON d.jenisMasalah = j.jenisID
    WHERE NOT EXISTS (
      SELECT 1
      FROM tiket t
      WHERE t.tiketID = d.tiketID
    )`;

  var data = await scrape();
  // console.log(data)

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
