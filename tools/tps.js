const fs = require('node:fs').promises;
const FNAME = 'data/blocks.csv';
const FNAME_OUT = 'data/tps.csv';
const frequencies = {};

const main = async () => {
    const data = await fs.readFile(FNAME, 'utf8').catch((e) => `${e}`);
    const lines = data.split('\n').slice(1);
    lines.forEach(processLine);
    // console.log(`message:`, {frequencies});
    const tpss = Object.values(frequencies).filter(e => !isNaN(e));
    console.log(`message:`, tpss);
    console.log(`message:`, {key: getMax(tpss)});
    await fs.writeFile(FNAME_OUT, tpss.join("\n"), 'utf8');
    // Aptos blockchain is supposed to handle an incredible 160,000 transactions per second (TPS) and is currently handling a significantly smaller sum of 4 TPS.
    // https://beincrypto.com/troubled-aptos-blockchain-manages-just-4-tps/
};

const getMax = (arr) => arr.reduce((a, b) => Math. max(a, b), -Infinity);


const processLine = (line) => {
    const columns = line.split(',');
    const rawTimestamp = Number(columns[1]);
    const timestamp = Math.trunc(rawTimestamp / 1_000_000); 
    const txs_count = columns[3]; 
    frequencies[timestamp] = (frequencies[timestamp] || 0 ) + Number(txs_count);
};

main();

