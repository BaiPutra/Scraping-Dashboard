const puppeteer = require("puppeteer");
const mongo = require("mongodb").MongoClient;

const url = "mongodb://localhost:27017";

mongo.connect(
  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },

  (err, client) => {
    if (err) {
      console.error(err);
      return;
    }
    db = client.db("scraping");
    scraping = db.collection("dataATM");
    kanca = db.collection('kanca');

    async function scrape() {
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();

      // login session
      await page.goto("http://portal.jke.bri.co.id/ech_admin/home");

      await page.waitForSelector("input.form-control:nth-child(1)");
      await page.type("input.form-control:nth-child(1)", "admin_jkt2", {
        delay: 70,
      });
      await page.type("input.form-control:nth-child(2)", "password", {
        delay: 70,
      });
      await page.click(".btn");

      await page.goto("http://portal.jke.bri.co.id/ech_admin/reg_tta_his", {
        waitUntil: "networkidle2",
      });

      let data_all = [];
      for (let i = 0; i < 1; i++) {
        await page.waitForTimeout(3000);
        await page.waitForSelector("#ext-gen60");
        await page.click("#ext-gen60");

        // const searchValue = await page.$eval('div.x-grid3-row:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1)', el => el.textContent);
        // console.log(searchValue)

        let data = await page.evaluate(() => {
          let results = [];
          let items = document.querySelectorAll(
            "div.x-grid3-row > table > tbody > tr"
          );
          items.forEach((item) => {
            results.push({
              ticket_id: item.querySelector("td:nth-child(1)").textContent,
              ticket_no: item.querySelector("td:nth-child(2)").textContent,
              tid: item.querySelector("td:nth-child(5)").textContent,
              rtl_problem: item.querySelector("td:nth-child(6)").textContent,
              lokasi: item.querySelector("td:nth-child(10)").textContent,
              kantor_cabang: item.querySelector("td:nth-child(12)").textContent,
              input_date: item.querySelector("td:nth-child(4)").textContent,
              last_update: item.querySelector("td:nth-child(22)").textContent,
              rtl_eskalasi: item.querySelector("td:nth-child(23)").textContent,
              rtl_status: item.querySelector("td:nth-child(24)").textContent,
            });
          });
          return results;
        });
        // merge array
        data_all.push(...data);
      }

      // console.log(data_all);
      
      scraping.deleteMany(data_all);
      const id_ticket = await scraping.insertMany(data_all);
      // scraping.insertMany(data_all);

      var duplicates = [];
      scraping
        .aggregate(
          [
            {
              $match: {
                name: { $ne: "" },
              },
            },
            {
              $group: {
                _id: { name: "$ticket_id" },
                dups: { $addToSet: "$_id" },
                count: { $sum: 1 },
              },
            },
            {
              $match: {
                count: { $gt: 1 },
              },
            },
          ],
          { allowDiskUse: true }
        )
        .forEach(function (doc) {
          doc.dups.shift();
          doc.dups.forEach(function (dupId) {
            duplicates.push(dupId);
          });
        });

      scraping.deleteMany({ _id: { $in: duplicates } });

      const col_kanca = [];
      for (let i = 0; i < data_all.length; i++) {
        col_kanca.push({ kantor_cabang: data_all[i].kantor_cabang, ticket_id: id_ticket.insertedIds[i].toString() });
      }

      console.log(col_kanca)

      kanca.deleteMany({});
      kanca.insertMany(col_kanca);
      

      await browser.close();
    }

    scrape();
  }
);
