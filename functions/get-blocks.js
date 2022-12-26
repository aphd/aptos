const fs = require('node:fs').promises;
const { TXS_FIXTURE } = process.env;
const BLOCKS_FN = './data/blocks.csv';
const TXS_FN = './data/txs.csv';
const START = 19980000;
const MAX_BLOCKS = 30;

module.exports.handler = async (_) => {
    const rawTxs = await getTxs();
    const blocks = await decodeBlocks(rawTxs);
    const txs = await decodeTxs(rawTxs);
    await writeLog({ blocks, txs });
    return { statusCode: 200 };
};

const getTxs = async () => {
    if (TXS_FIXTURE) return await readBlocksFile();
    let txs = [];
    let start = START;
    do {
        const urlParams = `?start=${start}&limit=10`;
        const url = `https://fullnode.mainnet.aptoslabs.com/v1/transactions${urlParams}`;
        const res = await fetch(url);
        txs.push(...(await res.json()));
        start = Number(txs.at(-1).version) + 1;
    } while (txs.length < MAX_BLOCKS);
    return txs;
};

const decodeBlocks = async (blocks) => {
    const rows = blocks.map(blockMap);
    return rows.join(`\n`);
};

const decodeTxs = async (blocks) => {
    console.log(`message:`, { blocks });
    const rawTxs = blocks.reduce(txReducer, []);
    const txs = rawTxs.map(txMap);
    return txs.join(`\n`);
};

const blockMap = (block) => {
    // TODO check if you can add other info
    // height,txs_count,gas_used,timestamp,human_date
    const { changes, timestamp, type, gas_used, version, vm_status, max_gas_amount: mga, gas_unit_price: gup } = block;
    const hDate = getHumanDate(timestamp);
    // height,timestamp,human_date,txs_count,type,vm_status,gas_used,max_gas_amount,gas_unit_price
    const head1st = `${version},${timestamp},${hDate},${changes.length}`;
    const head2nd = `${vm_status},${type},${gas_used},${mga},${gup}`;
    return `${head1st},${head2nd}`.replace(/undefined/g, 'NA'); // TODO look in R
};

const txMap = (tx) => {
    // TODO check if you can add other info
    // hash,height,type,timestamp
    const { type, hash, timestamp, version } = tx;
    return `${hash},${version},${type},${timestamp}`;
};

const getHashes = (change) => {
    const { state_key_hash: hash } = change;
    return hash;
};

const txReducer = (a, c) => {
    const { changes, timestamp, version } = c;
    const tx = changes.map((e) => ({ type: e.type, timestamp, version, hash: getHashes(e) }));
    return [...a, ...tx];
};

const readBlocksFile = async () => {
    if (!TXS_FIXTURE) throw `ERROR: BLOCKS not defined`;
    const blocks = await fs.readFile(TXS_FIXTURE, 'utf8');
    return JSON.parse(blocks);
};

const writeLog = async ({ blocks, txs }) => {
    await fs.appendFile(BLOCKS_FN, `${blocks}\n`, 'utf8');
    await fs.appendFile(TXS_FN, `${txs}\n`, 'utf8');
};

const getHumanDate = (timestamp) => {
    const num = Number(timestamp.slice(0, -3));
    return new Date(num).toISOString().slice(0, -5);
};

