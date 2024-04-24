const express = require('express')
const multer = require('multer')
const cors = require('cors');
const axios = require('axios')
const app = express()
const port = process.env.PORT || 5000

app.use(express.json())

const upload = multer({
    limits: {
        fileSize: 1000000
    }
})

const starton = axios.create({
    baseURL: "https://api.starton.io/v3",
    headers: {
        "x-api-key": "sk_live_f0796258-bc9f-4763-aa3b-51e6943d810d",
    },
})

app.post('/upload', cors(), upload.single('file'), async (req, res) => {
    const {name, description, receiverAddress} = req.body;
    console.log(name, description, receiverAddress)

    let data = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    data.append("file", blob, { filename: req.file.originalname })
    data.append("isSync", "true");

    async function uploadImageOnIpfs() {
        const ipfsImg = await starton.post("/ipfs/file", data, {
            headers: { "Content-Type": `multipart/form-data; boundary=${data._boundary}` },
        })
        return ipfsImg.data;
    }
    async function uploadMetadataOnIpfs(imgCid) {
        const metadataJson = {
            name: name,
            description: description,
            image: `ipfs://ipfs/${imgCid}`,
        }
        const ipfsMetadata = await starton.post("/ipfs/json", {
            name: `${name} metadata json`,
            content: metadataJson,
            isSync: true,
        })
        return ipfsMetadata.data;
    }

    const SMART_CONTRACT_NETWORK = "polygon-amoy"
    const SMART_CONTRACT_ADDRESS = "0x6f7EDDC3ce6972eDd76f353EE4FD028dA98B7060"
    const WALLET_IMPORTED_ON_STARTON = "0x48B74004885cEaE28944772ff9130f78AF52eB23";

    async function mintNFT(receiverAddress, metadataCid) {
        const nft = await starton.post(`/smart-contract/${SMART_CONTRACT_NETWORK}/${SMART_CONTRACT_ADDRESS}/call`, {
            functionName: "mint",
            signerWallet: WALLET_IMPORTED_ON_STARTON,
            speed: "low",
            params: [receiverAddress, metadataCid],
        })
        return nft.data;
    }


    const RECEIVER_ADDRESS = receiverAddress
    const ipfsImgData = await uploadImageOnIpfs();
    const ipfsMetadata = await uploadMetadataOnIpfs(ipfsImgData.cid);
    const nft = await mintNFT(RECEIVER_ADDRESS, ipfsMetadata.cid)
    // console.log(nft)
    res.status(201).json({
        transactionHash: nft.transactionHash,
        cid: ipfsImgData.cid,
        data
    })
})
app.listen(port, () => {
    console.log('Server is running on port ' + port);
})