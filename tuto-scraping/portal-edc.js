const puppeteer = require("puppeteer");
const mongo = require("mongodb").MongoClient;

const url = "mongodb://localhost:27017";

var urlBase1 = "http://mms.bri.co.id/index.php/maintenance/cm_report_new/";
var urlBase2 =
  "?id=&jenis=&user_entry=&mid=&sub_jenis=&tgl_sort=tgl_entry&tid=&kanwil=I&tgl_awal=2022-06-01&tgl_akhir=2022-06-30&status=&pemasang=&submit=Generate";

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
    scraping = db.collection("dataEDC");

    async function getLinks() {
      const links = [];

      for (let i = 0; i < 1; i++) {
        let url = urlBase1 + [i * 15] + urlBase2;
        links.push(url);
      }
      // console.log(links);
      return {
        links,
      };
    }

    async function getData(url, page) {
      await page.setDefaultNavigationTimeout(0);
      await page.goto(url, { waitUntil: "networkidle2" });

      // get the data
      let data = await page.evaluate(() => {
        let results = [];
        let items = document.querySelectorAll(".tabledata > tbody > tr");
        items.forEach((item) => {
          results.push({
            ticket:
              item.querySelector("td:nth-child(1)") &&
              item.querySelector("td:nth-child(1)").textContent,
            nama_merchant:
              item.querySelector("td:nth-child(2)") &&
              item.querySelector("td:nth-child(2)").textContent,
            mid:
              item.querySelector("td:nth-child(3)") &&
              item.querySelector("td:nth-child(3)").textContent,
            tid:
              item.querySelector("td:nth-child(4)") &&
              item.querySelector("td:nth-child(4)").textContent,
            peruntukan:
              item.querySelector("td:nth-child(5)") &&
              item.querySelector("td:nth-child(5)").textContent,
            ticket_masuk:
              item.querySelector("td:nth-child(6)") &&
              item.querySelector("td:nth-child(6)").textContent,
            update_ticket:
              item.querySelector("td:nth-child(7)") &&
              item.querySelector("td:nth-child(7)").textContent,
            jenis_masalah:
              item.querySelector("td:nth-child(8)") &&
              item.querySelector("td:nth-child(8)").textContent,
            status:
              item.querySelector("td:nth-child(9)") &&
              item.querySelector("td:nth-child(9)").textContent,
            kanwil:
              item.querySelector("td:nth-child(10)") &&
              item.querySelector("td:nth-child(10)").textContent,
            pemasang:
              item.querySelector("td:nth-child(11)") &&
              item.querySelector("td:nth-child(11)").textContent,
            target_penyelesaian:
              item.querySelector("td:nth-child(12)") &&
              item.querySelector("td:nth-child(12)").textContent,
          });
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

      // console.log(get_links.links)

      // login session
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
      console.log(dataEDC);

      // scraping.deleteMany({});

      scraping.insertMany(dataEDC);

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
                _id: { name: "$ticket" },
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

      scraping.deleteMany({ nama_merchant: null });

      const kanca = [];
      for (let i = 0; i < dataEDC.length; i++) {
        kanca.push({ kantor_cabang: data[i].pemasang, update: data[i].update });
      }

      await browser.close();
    }

    scrape();
  }
);
