const app = express()
const cors = require('cors')
const port = process.env.PORT || 6001

// medilware

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World! hr ')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})