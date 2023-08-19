import { PdfReader } from 'pdfreader';

const parsePdf = async (pdfBuffer) => {
  return new Promise((resolve, reject) => {
    const items = [];
    new PdfReader().parseBuffer(pdfBuffer, function (err, item) {
      if (err) reject(err);
      else if (!item) resolve(items);
      else if (item.text) {
        items.push(item);
      }
    });
  });
};

const bond = (prefix, num1, num2) => {
  let bonds = [];
  for (let i = num1; i <= num2; i++) {
    bonds.push(`${prefix}${i}`);
  }
  return bonds;
};

export const getBondsFromPdf = async (base64pdf) => {
  const pdfBuffer = Buffer.from(base64pdf, 'base64');
  const items = await parsePdf(pdfBuffer);
  //get all items within the table in the PDF (x and y coordinates)
  const filtered = items.filter((item) => {
    const { x, y } = item;
    return x >= 3.293 && y >= 23.4 && x <= 10.203;
  });
  const groups = [];
  let currentIdx = 0;

  //this creates a 2d array that looks like [['528W123456', 'to', '528W123457']]
  filtered.forEach((item) => {
    const currentGroupLength = groups[currentIdx]?.length || 0;
    if (!groups[currentIdx]) groups[currentIdx] = [item.text];
    else if (currentGroupLength === 3) {
      currentIdx++;
      groups[currentIdx] = [item.text];
    } else {
      groups[currentIdx].push(item.text);
    }
  });

  //this ensures only text that pertains to bond numbers is included, and removes the 'to'
  const filteredGroups = groups.filter((group) => group[1] === 'to').map((group) => [group[0], group[2]]);

  //this gets the prefix from and the number from start and end bonds
  //it then returns each individual bond number in the group
  return filteredGroups
    .map((group) => {
      const regex = /\d+$/;
      const start = group[0].match(regex)[0];
      const end = group[1].match(regex)[0];
      const prefix = group[0].replace(regex, '');
      return bond(prefix, start, end);
    })
    .flat();
};
