// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

// paste your secret that is logged here
const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        49, 220, 137, 110,  69, 233,  93,  19,  78, 103,  26,
        60, 197, 204, 214, 145, 237, 253,  89, 203,  38,  50,
       101,  64, 145,  80, 194,  27,  62,  27,  64,  57,  99,
       235, 164,  28, 134,  61,  98, 156,  85,  77,  56,  78,
       138,  77,  60, 172, 186,  40, 152, 244,  84, 181, 135,
        18,  54, 253, 246, 255, 241, 104, 120, 103
      ]            
);

const DEMO_FROM_PUBLIC_KEY = new Uint8Array(
    [
        99, 235, 164,  28, 134,  61,  98, 156,
        85,  77,  56,  78, 138,  77,  60, 172,
       186,  40, 152, 244,  84, 181, 135,  18,
        54, 253, 246, 255, 241, 104, 120, 103
      ]            
);

const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

    // Other things to try: 
    // 1) Form array from userSecretKey
    // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
    // 2) Make a new Keypair (starts with 0 SOL)
    // const from = Keypair.generate();

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    var senderWallet = await getWalletBalance(from.publicKey);
	console.log(`Sender Wallet balance: ${senderWallet / LAMPORTS_PER_SOL} SOL`);
	var transferToReceiver = BigInt(senderWallet) / BigInt(2);


    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: transferToReceiver
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(connection,transaction,[from]);
    console.log('Signature is', signature);
    var receiver = await getWalletBalance(to.publicKey);
	console.log(`Receiver balance :   ${receiver / LAMPORTS_PER_SOL}  SOL`);

    async function getWalletBalance(thePublicKey) {
        try {
            // Connect to the Devnet
            const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
            const walletBalance = await connection.getBalance(new PublicKey(thePublicKey));
            return walletBalance;

        } catch (err) {
            console.log(err);
        }
    }
}

transferSol();
