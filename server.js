import express from 'express'
import usersRoutes from './src/users/routes.js'
import cookieParser from "cookie-parser";
const app = express()
const port = 8080

app.use(express.json())
app.use("/users", usersRoutes)

app.use(express.json());
app.use(cookieParser())

app.get("/", (req, res)=> {
    res.send("Welcome to Idealibs")
})
app.listen(port, () => console.log(`app listening on port ${port}`))
