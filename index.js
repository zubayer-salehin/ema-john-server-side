const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) =>{
    res.send('John is running and waiting for Ema')
});

const uri = `mongodb+srv://${process.env.DB_USRR}:${process.env.DB_PASSWORD}@cluster0.5pmu7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        await client.connect();
        const productCollection = client.db('emajohn').collection('product');

        app.get('/product', async(req, res) =>{
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);

            const query = {};
            const cursor = productCollection.find(query);
            let products;
            if(page || size){
                // 0 --> skip: 0 get: 0-10(10): 
                // 1 --> skip: 1*10 get: 11-20(10):
                // 2 --> skip: 2*10 get: 21-30 (10):
                // 3 --> skip: 3*10 get: 21-30 (10):
                products = await cursor.skip(page*size).limit(size).toArray();
            }
            else{
                products = await cursor.toArray();
            }
            
            res.send(products);
        });

        app.get('/productCount', async(req, res) =>{
            const count = await productCollection.estimatedDocumentCount();
            res.send({count});
        });

        // use post to get products by ids
        app.post('/productByKeys', async(req, res) =>{
            const keys = req.body;
            const ids = keys.map(id => ObjectId(id));
            const query = {_id: {$in: ids}}
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

    }
    finally{}
}
run().catch(console.dir);


app.listen(port, () =>{
    console.log('John is running on  port', port);
})