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

  await page.goto(
    "https://www.bps.go.id/subject/8/ekspor-impor.html#subjekViewTab3",
    {
      waitUntil: "networkidle2",
    }
  );

  await page.waitForTimeout(3000);

  let data = await page.evaluate(() => {
    let results = [];
    let items = document.querySelectorAll(
      "#listTabel1 > tbody:nth-child(2) > tr"
    );
    items.forEach((item) => {
      results.push([
        item.querySelector("td:nth-child(2)").textContent,
        item.querySelector("td:nth-child(3)").textContent,
        item.querySelector("td:nth-child(4)").textContent,
      ]);
    });
    return results;
  });

  await browser.close();
  console.log("test 1");
  return data;
}

con.connect(async function (err) {
  if (err) throw err;
  console.log("Connected!");

  var sql = "INSERT INTO bps (judul, update_date, keterangan) VALUES ?";
  var sql2 = `
  DELETE FROM bps WHERE id IN(  
    SELECT id FROM (SELECT id, ROW_NUMBER()   
       OVER (PARTITION BY judul ORDER BY judul) AS row_num   
    FROM bps) AS temp_table WHERE row_num > 1
  );
  `;
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
});
