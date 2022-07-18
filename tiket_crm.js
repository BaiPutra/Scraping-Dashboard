const puppeteer = require('puppeteer');
var mysql = require('mysql')

var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'scraping',
});

async function scrape() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // login session
    await page.goto('http://portal.jke.bri.co.id/ech_admin/home');

    await page.waitForSelector('input.form-control:nth-child(1)');
    await page.type('input.form-control:nth-child(1)', 'admin_jkt2', { delay: 70 });
    await page.type('input.form-control:nth-child(2)', 'password', { delay: 70 });
    await page.click('.btn');

    await page.goto('http://portal.jke.bri.co.id/ech_admin/reg_tta_his', {
        waitUntil: 'networkidle2',
    });

    await page.waitForSelector('#ext-gen39')
    await page.click('#ext-gen39')
    await page.click('div.x-combo-list-item:nth-child(2)')

    let data_all = [];
    for (let i = 0; i < 2; i++) {
        await page.waitForTimeout(3000);
        await page.waitForSelector('#ext-gen60');
        await page.click('#ext-gen60');

        let data = await page.evaluate(() => {
            let results = [];
            let items = document.querySelectorAll("div.x-grid3-row > table > tbody > tr");
            items.forEach((item) => {
                results.push([
                    item.querySelector("td:nth-child(1)").textContent,
                    item.querySelector("td:nth-child(2)").textContent,
                    item.querySelector("td:nth-child(5)").textContent,
                    item.querySelector("td:nth-child(6)").textContent,
                    item.querySelector("td:nth-child(10)").textContent,
                    item.querySelector("td:nth-child(12)").textContent,
                    item.querySelector("td:nth-child(4)").textContent,
                    item.querySelector("td:nth-child(22)").textContent,
                    item.querySelector("td:nth-child(23)").textContent,
                    item.querySelector("td:nth-child(24)").textContent,
                ]);
            });
            return results;
        });
        data_all.push(...data)
    }

    await browser.close();
    console.log('test 1');
    return data_all;
}

con.connect(async function (err) {
    if (err) throw err;
    console.log('Connected');

    var sql = 'INSERT INTO ticket_ATM_CRM (ticket_id, ticket_no, tid, rtl_problem, lokasi, kantor_cabang, input_date, last_update, rtl_eskalasi, rtl_status) VALUES ?'
    var sql2 = `
    DELETE FROM ticket_ATM_CRM WHERE id IN(
        SELECT id FROM (SELECT id, ROW_NUMBER()
            OVER(PARTITION BY ticket_id ORDER BY ticket_id) AS row_num
        FROM ticket_ATM_CRM) AS temp_table WHERE row_num > 1
    );
    `
    var data = await scrape();
    console.log(data)
    
    con.query(sql, [data], function (err) {
        if (err) throw err;
        console.log({ count: data.length });
    });

    con.query(sql2, function (err, res) {
        if (err) throw err;
        console.log({ res });
    });
})