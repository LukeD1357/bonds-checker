import axios from 'axios';
import moment from 'moment';
import exceljs from 'exceljs';
import lodash from 'lodash';
import { put, batchGet } from './db.js';

export const getCurrentWinners = async () => {
  const currentPeriod = moment().format('MMMM-YYYY').toLowerCase();
  let winnersData = await getBondWinners(currentPeriod);
  if (!winnersData) {
    const response = await axios.get(`https://www.nsandi.com/files/asset/xlsx/prize-${currentPeriod}.xlsx`, {
      responseType: 'arraybuffer',
    });
    const winnersXlsx = response.data;
    const data = await parseXlsx(winnersXlsx);
    await uploadToDynamoDb(currentPeriod, data);
    return data.reduce((acc, item) => {
      acc[item.bondNumber] = item;
      return acc;
    });
  }
  return winnersData;
};

const getBondWinners = async (date) => {
  const dates = Array.from({ length: 5 });
  const response = await batchGet(
    'bonds-winners',
    dates.map((_, idx) => ({ date: `${date}::${idx}` })),
  );
  if (response.length === 0) return null;
  return response.reduce((acc, item) => {
    item.data.forEach((bond) => {
      acc[bond.bondNumber] = bond;
    });
    return acc;
  }, {});
};

const uploadToDynamoDb = async (date, rows) => {
  const TableName = 'bonds-winners';
  const chunked = lodash.chunk(rows, 4000);
  for (let i = 0; i < chunked.length; i++) {
    await put(TableName, { date: `${date}::${i}`, data: chunked[i] });
  }
};

export const parseXlsx = async (buffer) => {
  const workbook = new exceljs.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.getWorksheet('natsav');

  // create an array of all rows with values in the worksheet
  const rows = [];
  const columns = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 3) {
      columns.push(...row.values);
    }
    if (rowNumber > 1) {
      const rowData = row.values.reduce((acc, value, idx) => {
        acc[columns[idx]] = value;
        return acc;
      }, {});
      const { 'Winning Bond NO.': bondNumber, 'Prize Value': prizeValue } = rowData;
      rows.push({ bondNumber, prizeValue });
    }
  });
  return rows;
};
