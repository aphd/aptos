// https://fullnode.mainnet.aptoslabs.com/v1/spec#/operations/get_transactions

const main = async () => {
    const url = 'https://fullnode.mainnet.aptoslabs.com/v1/transactions';
    const res = await fetch(url);
    const txs = await res.json();
    txs.forEach(tx => {
        const {timestamp} = tx;
        console.log(`message:`, {timestamp: getTimestamp(tx)});
    })
};

const getTimestamp = ({timestamp}) => {
    const num = Number(timestamp.slice(0, -3));
    return new Date(num);
}

main();

