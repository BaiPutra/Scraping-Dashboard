const puppeteer = require("puppeteer");
var mysql = require("mysql");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "scraping",
});

var todayDate = new Date();
var today = todayDate.toISOString().slice(0, 10)
todayDate.setDate(todayDate.getDate() - 1);
var yesterday = todayDate.toISOString().slice(0, 10)

var urlBase1 = 'http://mms.bri.co.id/index.php/maintenance/cm_report_new/';
var urlBase2 =
  '?id=&jenis=&user_entry=&mid=&sub_jenis=&tgl_sort=tgl_update&tid=&kanwil=I&tgl_awal='+yesterday+'&tgl_akhir='+today+'&status=CLOSED&pemasang=&submit=Generate';

async function getLinks() {
  const links = [];

  for (let i = 0; i < 1; i++) {
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
          item.querySelector("td:nth-child(1)").textContent,
        item.querySelector("td:nth-child(2)") &&
          item.querySelector("td:nth-child(2)").textContent,
        item.querySelector("td:nth-child(3)") &&
          item.querySelector("td:nth-child(3)").textContent,
        item.querySelector("td:nth-child(4)") &&
          item.querySelector("td:nth-child(4)").textContent,
        item.querySelector("td:nth-child(5)") &&
          item.querySelector("td:nth-child(5)").textContent,
        item.querySelector("td:nth-child(6)") &&
          item.querySelector("td:nth-child(6)").textContent,
        item.querySelector("td:nth-child(7)") &&
          item.querySelector("td:nth-child(7)").textContent,
        item.querySelector("td:nth-child(8)") &&
          item.querySelector("td:nth-child(8)").textContent,
        item.querySelector("td:nth-child(9)") &&
          item.querySelector("td:nth-child(9)").textContent,
        item.querySelector("td:nth-child(10)") &&
          item.querySelector("td:nth-child(10)").textContent,
        item.querySelector("td:nth-child(11)") &&
          item.querySelector("td:nth-child(11)").textContent,
        item.querySelector("td:nth-child(12)") &&
          item.querySelector("td:nth-child(12)").textContent,
      ]);
    });
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

  await page.goto("http://mms.bri.co.id/index.php/user/login");
  await page.waitForSelector("#cboxClose");
  await page.click("#cboxClose");
  await page.waitForSelector("#username");
  await page.type("#username", "00259061", { delay: 70 });
  await page.type("#password", "P@ssw0rdkomplek", { delay: 70 });
  await page.click("#loginBtn");

  for (let link of get_links.links) {
    var data_EDC = await getData(link, page);
    Array.prototype.push.apply(dataEDC, data_EDC.data);
  }

  await browser.close();
  console.log(dataEDC);
  return dataEDC;
}

scrape()

// con.connect(async function (err) {
//   if (err) throw err;
//   console.log("Connected");

//   var sql =
//     "INSERT INTO data_edc (ticket_id, merchant, mid, tid, peruntukan, entry_ticket, update_ticket, jenis_masalah, status, kanwil, pemasang, target_hari) VALUES ?";

//   var sql2 = `
//     DELETE FROM data_edc 
//     WHERE ticket_id = 0 OR id IN(
//         SELECT id FROM (SELECT id, ROW_NUMBER()
//             OVER(PARTITION BY ticket_id ORDER BY ticket_id) AS row_num
//         FROM data_edc) AS temp_table WHERE row_num > 1
//     )`;

//   var sql3 = `
//     UPDATE data_edc
//     SET pemasang = CASE WHEN pemasang = 'KC Jakarta SAHARJO' THEN 'KC JKT Saharjo'
//                         WHEN pemasang = 'KANCA DEPOK' THEN 'KC Depok'
//                         WHEN pemasang = 'KC Jakarta PASAR MINGGU' THEN 'KC JKT PASAR MINGGU'
//                         WHEN pemasang = 'KC Jakarta PANGLIMA POLIM' THEN 'KC JKT Panglima Polim'
//                         WHEN pemasang = 'KC Jakarta KRAMAT JATI' THEN 'KC JKT Kramat Jati'
//                         WHEN pemasang = 'KC Jakarta KALIBATA' THEN 'KC JKT Kalibata'
//                         WHEN pemasang = 'KC Jakarta GATOT SUBROTO' THEN 'KC JKT Gatot Subroto'
//                         WHEN pemasang = 'KC Jakarta TB SIMATUPANG' THEN 'KC JKT TB Simatupang'
//                         WHEN pemasang = 'KC Jakarta KEBAYORAN BARU' THEN 'KC JKT Kebayoran Baru'
//                         WHEN pemasang = 'KC Jakarta RADIO DALAM' THEN 'KC JKT Radio Dalam'
//                         WHEN pemasang = 'KC Jakarta WARUNG BUNCIT' THEN 'KC JKT Warung Buncit'
//                     END
//     WHERE pemasang IN ('KC Jakarta SAHARJO', 'KC DEPOK', 'KC Jakarta PASAR MINGGU',
//         'KC Jakarta PANGLIMA POLIM', 'KC Jakarta KRAMAT JATI', 'KC Jakarta KALIBATA', 
//         'KC Jakarta GATOT SUBROTO', 'KC Jakarta TB SIMATUPANG', 'KC Jakarta KEBAYORAN BARU', 
//         'KC Jakarta RADIO DALAM', 'KC Jakarta WARUNG BUNCIT', 'KANCA DEPOK');
//     `;

//   var sql4 = `
//     UPDATE data_edc t1 
// 	  INNER JOIN jenis_tiket t2 
// 		  ON t1.jenis_masalah = t2.jenis_masalah
//     INNER JOIN pemasang t3
//     	ON t1.pemasang = t3.nama_pemasang
//     SET t1.jenis_masalah = t2.id, t1.pemasang = t3.id;
//     `;

//   var sql5 = `
//     INSERT INTO tiket_edc
//     SELECT * FROM data_edc AS d
//     WHERE NOT EXISTS (
//       SELECT 1
//       FROM tiket_edc AS t
//       WHERE t.ticket_id = d.ticket_id
//     )
//     `;

//   var data = await scrape();

//   con.query(sql, [data], function (err) {
//     if (err) throw err;
//     console.log({ count: data.length });
//   });

//   con.query(sql2, function (err, res) {
//     if (err) throw err;
//     console.log({ res });
//   });

//   con.query(sql3, function (err, res) {
//     if (err) throw err;
//     console.log({ res });
//   });

//   con.query(sql4, function (err, res) {
//     if (err) throw err;
//     console.log({ res });
//   });

//   con.query(sql5, function (err, res) {
//     if (err) throw err;
//     console.log({ res });
//   });
// });
