// MODULES
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv')
const bodyParser = require('body-parser');
const cors = require('cors');

// INITIALIZATION
const app = express();
dotenv.config();
const port = 3000;

const username = process.env.MONGODB_USERNAME
const password = process.env.MONGODB_PASSWORD
// CONNECT TO MongoDB
mongoose.connect(`mongodb+srv://${username}:${password}@charliee01.qqyy2ji.mongodb.net/registrationDataDB`);

// ENABLE CORS AND body-parser 
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// SET VIEW ENGINE TO EJS
app.set('view engine', 'ejs');

// DEFINE MoneyTracker SCHEMA AND MODEL
const MoneyTrackerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    entry: {
        type: String,
    },
    balance: {
        type: Number,
    },
    amount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});
const MoneyTracker = mongoose.model("MoneyTracker", MoneyTrackerSchema);

// THIS CALCULATION IS FOR INDEX.EJS
app.get('/', async (req, res) => {
  try {
      
      const incomeData = await MoneyTracker.find({ entry: "income" });
      const expenseData = await MoneyTracker.find({ entry: "expense" });

      const totalIncome = incomeData.reduce((total, transaction) => total + transaction.amount, 0);
      const totalExpense = expenseData.reduce((total, transaction) => total + transaction.amount, 0);
      const balance = totalIncome - totalExpense;

      res.render('index', { totalIncome, totalExpense, balance });

  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

//WHEN THERE IS NOT ENTRIES RENDER 'addTransaction.ejs'
app.get('/addTransaction', (req, res) => {
    res.render('addTransaction');
  });

app.get('/edit', (req,res)=>{
    res.render('edit')
})

//LOGIC
app.get('/expense',async (req, res) => {
  try {
    const data = await MoneyTracker.find({ entry: "expense" }).sort({createdAt:'desc'});

    if (data.length === 0) {
        res.status(404).redirect('addTransaction');
        return;
    }

    res.render('expense', { transactions: data });
} catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
}
});


app.get('/income', async (req, res) => {
    try {
        const data = await MoneyTracker.find({ entry: "income" }).sort({createdAt:'desc'});

        if (data.length === 0) {
            res.status(404).redirect('addTransaction');
            return;
        }

        res.render('income', { transactions: data });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/deleteAllTransactions', async (req, res) => {
  try {
      // Delete all transactions
      await MoneyTracker.deleteMany({});
      res.redirect('/');
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});
app.post('/delete',async(req,res)=>{
    try{
        // delete single transactions
        await MoneyTracker.deleteOne({});
        if(entry="income"){
            res.redirect('/income')
        } else{
            res.redirect('/expense')
        }
    }catch (error){
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})

app.get('/edit/:id', async(req,res)=>{
    try {
        const transaction = await MoneyTracker.findById(req.params.id);
    
        if (!transaction) {
          return res.status(404).send('Transaction not found');
        }
    
        res.render('edit', { transaction }); 
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
})
//EDITING BY ID
app.post('/update/:id', async (req, res) => {
    try {
      const transactionId = req.params.id;
      const updatedData = {
        title: req.body.title,
        amount: req.body.amount,
      };
 
      await MoneyTracker.findByIdAndUpdate(transactionId, updatedData);
      if(entry="income"){
        res.redirect('/income')
       } else{
        res.redirect('/expense')
        } 
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  

//LOGIC
app.post("/register", (req, res) => {
    const { title, amount, createdAt, entry } = req.body;
    const MoneyTrackerData = new MoneyTracker({
        title, amount, createdAt, entry
    });

    MoneyTrackerData.save();

    if (entry === "income") {
        res.redirect('income');
    } else {
        res.redirect('expense');
    }
});



// SERVER : PORT
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
