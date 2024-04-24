import { useState } from "react";
import './FileUpload.css';

const FileUpload = () => {

    const [file, setFile] = useState(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [receiverAddress, setReceiverAddress] = useState("");
    const [cid, setCid] = useState("");
    const [transaction, setTransaction] = useState("");


    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            if (file) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("name", name);
                formData.append("description", description);
                formData.append("receiverAddress", receiverAddress);
                console.log(formData)
                const response = await fetch('http://localhost:5000/upload', {
                    method: 'POST',
                    body: formData
                }).then(response => response.json())
                    .then(data => {
                        setCid(data.cid);
                        setTransaction(data.transactionHash)
                        console.log(data.cid)
                        console.log(data.transactionHash)
                        console.log(data.data)
                    })
                    .catch(error => {
                        console.error(error);
                    })
            }
        } catch (error) {
            alert(error);
        }
    }
    const retreieveFile = (event) => {
        try {
            const data = event.target.files[0];
            setFile(data);
            event.preventDefault();
        } catch (error) {
            alert("Retrieve File Does Not Worked");
        }
    }
    return <>
        <div className="img-ctr">
            {cid && <a href={`https://${cid}.ipfs.dweb.link`} target="_blank"><img src={`https://${cid}.ipfs.dweb.link`} height={"250px"} /></a>}
        </div>
        <div className="transaction">
            {transaction && <a href={`https://amoy.polygonscan.com/tx/${transaction}`} target="_blank">Transaction Detials</a>}
        </div>
        <div className="form">
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name</label>
                    <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)}/>
                </div>
                <div>
                    <label htmlFor="description">Description</label>
                    <input type="text" name="description" id="description" value={description} onChange={(e) => setDescription(e.target.value)}/>
                </div>
                <div>
                    <label htmlFor="receiverAddress">Receiver Address</label>
                    <input type="text" name="receiverAddress" id="receiverAddress" value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)}/>
                </div>
                <div>

                    <label>Choose File</label>
                    <input type="file" className="choose" onChange={retreieveFile} />
                </div>
                <button className="btn">NFt Minter</button>
            </form>
        </div>
    </>
}
export default FileUpload;