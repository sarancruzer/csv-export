
'use strict';

const fs = require('fs');
var path = require('path'); 
const { convertArrayToCSV } = require('convert-array-to-csv');
const readFromFile = async (filename: string) => {
  const results = [];
  const input_data = await fs.promises.readFile(path.join(__dirname,'../csvfiles', filename), 'utf8');
  const csv_data = input_data.toString().replace(/\r\n/g,'\n').trim('');
  const headers = ['id', 'area', 'productName', 'qty', 'brandName'];
  const ordersData = csvJSON(csv_data, headers);
  return ordersData;
}

const writeToFile = async (data: any[], filename: string)  => {
  await fs.promises.writeFile(path.join(__dirname,'../csvfiles', filename+'.csv'), data, {
    encoding: 'utf8'
  });
  console.log("done")
}

const csvJSON = (csv: string, headers: string[]) => {
  var lines=csv.split("\n");
  var result = [];
  for(var i=0;i<lines.length;i++){
      var obj = {};
      var currentline=lines[i].split(",");
      for(var j=0;j<headers.length;j++){
          obj[headers[j]] = currentline[j];
      }
      result.push(obj);
  }
  return result; 
}

const exportAverageofProduct = async (data: any[], filename: string) => {
let avgData = data.map(ele => Object.values({ productName: ele.productName, qty: ele.qty }))
const csvDataToExport = convertArrayToCSV(avgData);
await writeToFile(csvDataToExport, `0_${filename}`);
}

const exportPopularBrands = async (data: any[], filename: string) => {
let avgData = data.map(ele => Object.values({ productName: ele.productName, brandName: ele.brandName }))
const csvDataToExport = convertArrayToCSV(avgData);
await writeToFile(csvDataToExport, `1_${filename}`);
}

const getPopularOrders = async (orders: any[]) => {
  return orders
  .reduce((accumulator, currentItem) => {
    
    const matchedItem = accumulator.find(
      (item: { productName: string; }) => item.productName.trim() === currentItem.productName.trim()
    );
    if (!matchedItem) {
      return [...accumulator, currentItem];
    } else {
      matchedItem.qty = Number(matchedItem.qty) + Number(currentItem.qty);
      return accumulator;
    }
  }, [])
  .map((order: { qty: number; }) => Object.assign(order, { qty: order.qty / orders.length }));
}


const stdinInput = () => {
    process.stdin.on('data', async data => {
      let userInput = data.toString().replace(/\r?\n|\r/g, "");
      console.log(`You typed ${userInput}`);      
        const input_data = await readFromFile('input_example.csv');  
        const orders = await getPopularOrders(input_data)
        await exportAverageofProduct(orders, userInput);
        await exportPopularBrands(orders, userInput);
        process.exit();   
      })
  }
   
const stdin = stdinInput();
  