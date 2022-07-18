let tableCell01;
let tableCell01Val;
let tableCell02;
let tableCell02Val;

const tableRows = await page.$$("table.tableFile2 > tbody > tr");

for (let i = 1; i < tableRows.length; i++) {
  tableRow = tableRows[i];
  tableCell01 = await tableRow.$("td:nth-child(1) a");
  tableCell01Val = await page.evaluate(
    (tableCell01) => tableCell01.innerText,
    tableCell01
  );
  tableCell02 = await tableRow.$("td:nth-child(2)");
  tableCell02Val = await page.evaluate(
    (tableCell02) => tableCell02.innerText,
    tableCell02
  );

  tableCell02ValA.replace(/(^\s+|\s+$)/g, "");

  console.log("\n");
  console.log("ID: " + tableCell01Val);
  console.log("Company: " + tableCell02Val);
  console.log("Iterator: " + i);

  const insertCompanyList =
    "INSERT INTO companyList ( company_name, id ) values (?,?)";

  let rows = await new Promise((resolve, reject) => {
    connection.query(
      insertCompanyList,
      [tableCell02Val, tableCell01Val],
      function (err, rows) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("DB insert successful. Record: " + i);
          resolve(rows);
        }
      }
    );
  });
}
