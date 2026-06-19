import express from "express";

import errorMiddleware from "./middleware/error.middleware";
import userrouter from "./module/user/routes/auth.routes";
import catogaryrouter from "./module/user/routes/catogary.routes"
import subcategoryrouter from "./module/user/routes/subcatpgary.routes"
import cors from "cors";


import productrouter from "./module/user/routes/product.routes"
import attributerouter from "./module/user/routes/attribute.routes"
import cartrouter from "./module/cart/routes/cart.routes";
import wishlistrouter from "./module/wishlist/routes/wishlist.routes";


const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Allow any localhost or 127.0.0.1 domain on any port
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,                // Important: allows cookies to be sent/received
}));

app.use(express.json()); // ✅ REQUIRED
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello Worlds!"); // Added a proper response
});


app.use("/api/user", userrouter)
app.use("/api/catogary", catogaryrouter)
app.use("/api/suncatogary", subcategoryrouter)
app.use("/api/product", productrouter)
app.use("/api/attribute", attributerouter)
app.use("/api/cart", cartrouter)
app.use("/api/wishlist", wishlistrouter)





app.use(errorMiddleware);
app.listen(4000, () => console.log("Server running on port 4000"));