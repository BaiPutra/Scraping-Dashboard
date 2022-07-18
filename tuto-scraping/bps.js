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
    collection1 = db.collection("bps1");
    collection2 = db.collection('bps2');

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
          // results.push({
          //   judul_tabel: item.querySelector("td:nth-child(2)").textContent,
          //   update: item.querySelector("td:nth-child(3)").textContent,
          //   keterangan: item.querySelector("td:nth-child(4)").textContent,
          // });
          results.push([
            item.querySelector("td:nth-child(2)").textContent,
            item.querySelector("td:nth-child(3)").textContent,
            item.querySelector("td:nth-child(4)").textContent
          ])
        });
        return results;
      });

      console.log(data);

      // const col1 = [];
      // for (let i = 0; i < data.length; i++) {
      //   col1.push({ judul_tabel: data[i].judul_tabel, update: data[i].update });
      // }

      // collection1.deleteMany({});
      // const saveData = await collection1.insertMany(col1);
      // // collection1.insertMany(col1);
      // // console.log(saveData);

      // const col2 = [];
      // for (let i = 0; i < data.length; i++) {
      //   col2.push({ keterangan: data[i].keterangan, update: saveData.insertedIds[i].toString() });
      // }
      // collection2.deleteMany({})
      // collection2.insertMany(col2);

      // console.log(col2);

      await browser.close();
    }

    scrape();
  }
);
