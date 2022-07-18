const puppeteer = require('puppeteer');
var mysql = require('mysql')

var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'scraping',
});

var urlBase1 = 'https://top-1000-sekolah.ltmpt.ac.id/?page=';
var urlBase2 = '&per-page=100';

async function getLinks() {
    const links = [];

    for (let i = 0; i < 3; i++) {
        let url = urlBase1 + [i] + urlBase2;
        links.push(url);
    }
    // console.log(links);
    return {
        links,
    };
}

async function getData(url, page) {
    // await page.setDefaultNavigationTimeout(0);
    await page.goto(url, { waitUntil: "networkidle2" });

    // get the data
    let data = await page.evaluate(() => {
        let results = [];
        // let items = document.querySelectorAll(".tabledata > tbody > tr");
        let items = document.querySelectorAll(".table > tbody > tr");
        items.forEach((item) => {
            results.push([
                item.querySelector("td:nth-child(3)").textContent,
                item.querySelector("td:nth-child(6)").textContent,
                // item.querySelector("td:nth-child(3)") && item.querySelector("td:nth-child(3)").textContent,
                // item.querySelector("td:nth-child(4)") && item.querySelector("td:nth-child(4)").textContent,
                // item.querySelector("td:nth-child(5)") && item.querySelector("td:nth-child(5)").textContent,
                // item.querySelector("td:nth-child(6)") && item.querySelector("td:nth-child(6)").textContent,
                // item.querySelector("td:nth-child(7)") && item.querySelector("td:nth-child(7)").textContent,
                // item.querySelector("td:nth-child(8)") && item.querySelector("td:nth-child(8)").textContent,
                // item.querySelector("td:nth-child(9)") && item.querySelector("td:nth-child(9)").textContent,
                // item.querySelector("td:nth-child(10)") && item.querySelector("td:nth-child(10)").textContent,
                // item.querySelector("td:nth-child(11)") && item.querySelector("td:nth-child(11)").textContent,
                // item.querySelector("td:nth-child(12)") && item.querySelector("td:nth-child(12)").textContent,
            ]);
        });
        // for (let i = 1; i < 16; i++) {
        //     let results = results[i];
        //     results.push([])
        // }
        return results;
    });

    return {
        data,
    }
}

async function scrape() {
    var get_links = await getLinks();
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const dataEDC = []; 

    // login session
    // await page.goto('http://mms.bri.co.id/index.php/user/login');
    // await page.waitForSelector('#cboxClose');
    // await page.click('#cboxClose');
    // await page.waitForSelector('#username');
    // await page.type('#username', '00259061', { delay: 70 });
    // await page.type('#password', 'P@ssw0rdkomplek', { delay: 70 });
    // await page.click('#loginBtn');

    for (let link of get_links.links) {
        var data_EDC = await getData(link, page);
        // ??? 
        Array.prototype.push.apply(dataEDC, data_EDC.data);
    }

    await browser.close();
    console.log('test EDC');
    console.log(dataEDC);
    return dataEDC;
}

con.connect(async function (err) {
    if (err) throw err;
    console.log('Connected');

    var sql = 'INSERT INTO ltmpt (data_satu, data_dua) VALUES ?';
    // var sql2 = `
    // DELETE FROM ticket_ATM_CRM WHERE id IN(
    //     SELECT id FROM (SELECT id, ROW_NUMBER()
    //         OVER(PARTITION BY ticket_id ORDER BY ticket_id) AS row_num
    //     FROM ticket_ATM_CRM) AS temp_table WHERE row_num > 1
    // );
    // `
    var data = await scrape();
    // console.log(data);

    con.query(sql, [data], function (err) {
        if (err) throw err;
        console.log({ count: data.length });
    });

    // con.query(sql2, function (err, res) {
    //     if (err) throw err;
    //     console.log({ res });
    // });
})