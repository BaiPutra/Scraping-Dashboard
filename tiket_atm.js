const puppeteer = require('puppeteer')
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
                    item.querySelector("td:nth-child(5)").textContent,
                    item.querySelector("td:nth-child(6)").textContent,
                    item.querySelector("td:nth-child(7)").textContent,
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

    var sql = 'INSERT INTO data_ATM_CRM (ticket_id, tid, bagian, rtl_problem, lokasi, kantor_cabang, input_date, last_update, rtl_eskalasi, rtl_status) VALUES ?'
    var sql2 = `
    DELETE FROM data_ATM_CRM WHERE id IN(
        SELECT id FROM (SELECT id, ROW_NUMBER()
            OVER(PARTITION BY ticket_id ORDER BY ticket_id) AS row_num
        FROM data_ATM_CRM) AS temp_table WHERE row_num > 1
    );
    `
    var sql3 = `
    UPDATE data_atm_crm
    SET kantor_cabang = CASE WHEN kantor_cabang = 'KC BOGOR PAJAJARAN' THEN '1'
                            WHEN kantor_cabang = 'KC JKT SAHARJO' THEN '2'
                            WHEN kantor_cabang = 'KC DEPOK' THEN '3'
                            WHEN kantor_cabang = 'KC JKT PASAR MINGGU' THEN '4'
                            WHEN kantor_cabang = 'KC BEKASI HARAPAN INDAH' THEN '5'
                            WHEN kantor_cabang = 'KC PONDOK GEDE' THEN '6'
                            WHEN kantor_cabang = 'KC BOGOR DEWI SARTIKA' THEN '7'
                            WHEN kantor_cabang = 'KC TAMBUN' THEN '8'
                            WHEN kantor_cabang = 'KC CIKARANG' THEN '9'
                            WHEN kantor_cabang = 'KC CINERE' THEN '10'
                            WHEN kantor_cabang = 'KC JKT PANGLIMA POLIM' THEN '11'
                            WHEN kantor_cabang = 'KC CIBUBUR' THEN '12'
                            WHEN kantor_cabang = 'KC CIBINONG' THEN '13'
                            WHEN kantor_cabang = 'KC JKT KRAMAT JATI' THEN '14'
                            WHEN kantor_cabang = 'KC JKT KALIBATA' THEN '15'
                            WHEN kantor_cabang = 'KC FATMAWATI' THEN '16'
                            WHEN kantor_cabang = 'KC PEKAYON' THEN '17'
                            WHEN kantor_cabang = 'KC JKT GATOT SUBROTO' THEN '18'
                            WHEN kantor_cabang = 'KC CIMANGGIS' THEN '19'
                            WHEN kantor_cabang = 'KC BEKASI' THEN '20'
                            WHEN kantor_cabang = 'KC JKT TB SIMATUPANG' THEN '21'
                            WHEN kantor_cabang = 'KC CIKAMPEK' THEN '22'
                            WHEN kantor_cabang = 'KC KARAWANG' THEN '23'
                            WHEN kantor_cabang = 'KC PONDOK INDAH' THEN '24'
                            WHEN kantor_cabang = 'KC JKT KEBAYORAN BARU' THEN '25'
                            WHEN kantor_cabang = 'KC JKT RADIO DALAM' THEN '26'
                            WHEN kantor_cabang = 'KC JKT WARUNG BUNCIT' THEN '27'
                            WHEN kantor_cabang = 'KC PANCORAN' THEN '28'
                        END
    WHERE kantor_cabang IN ('KC BOGOR PAJAJARAN', 'KC JKT SAHARJO', 'KC DEPOK', 'KC JKT PASAR MINGGU', 
        'KC BEKASI HARAPAN INDAH', 'KC PONDOK GEDE', 'KC BOGOR DEWI SARTIKA', 'KC TAMBUN', 'KC CIKARANG', 'KC CINERE', 
        'KC JKT PANGLIMA POLIM', 'KC CIBUBUR', 'KC CIBINONG', 'KC JKT KRAMAT JATI', 'KC JKT KALIBATA', 
        'KC FATMAWATI','KC PEKAYON', 'KC JKT GATOT SUBROTO', 'KC CIMANGGIS', 'KC BEKASI', 'KC JKT TB SIMATUPANG', 
        'KC CIKAMPEK', 'KC KARAWANG', 'KC PONDOK INDAH', 'KC JKT KEBAYORAN BARU', 'KC JKT RADIO DALAM', 'KC JKT WARUNG BUNCIT', 
        'KC PANCORAN');
    `
    var sql4 = `
    INSERT INTO tiket_atm_crm
    SELECT *
    FROM data_atm_crm
    WHERE rtl_eskalasi = 'KANWIL BRI' OR rtl_eskalasi = 'BRISAT';
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

    con.query(sql3, function (err, res) {
        if (err) throw err;
        console.log({ res });
    });

    con.query(sql4, function (err, res) {
        if (err) throw err;
        console.log({ res })
    });
})