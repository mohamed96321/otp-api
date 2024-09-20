require("dotenv").config();
const path = require("path");
const { dbConnection } = require('./config/database');
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const hpp = require("hpp");
const ApiError = require("./utils/apiError");
const User = require("./models/userModel");
const globalError = require("./middlewares/errorMiddleware");
require('./utils/cronJobs');

// Routes
const mountRoutes = require("./routes");

// Express app
const app = express();

// Cors
app.use(cors(
  {
    origin: process.env.BASE_CLIENT_URL,
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }
));
app.options('*', cors());

// Compress all responses
app.use(compression());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Middleware to protect against HTTP Parameter Pollution attacks
app.use(helmet());

app.use(hpp()); // <- THIS IS THE NEW LINE

// Welcome route
app.get("/", (req, res) => {
  res.status(200).send({
    success: true,
    message: "Welcome to the API. It is up and running!",
  });
});

// Mount Routes
mountRoutes(app);

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
  console.log(`Server is running on port: ${PORT}`);

  await dbConnection();

  try {
    // Create admin users if they don't already exist
    const adminEmails = [process.env.ADMIN_EMAIL_ONE, process.env.ADMIN_EMAIL_TWO];
    for (const email of adminEmails) {
      const adminExists = await User.findOne({ where: { email } });

      if (!adminExists) {
        await User.create({
          name: 'Admin',
          email: email,
          password: process.env.ADMIN_PASSWORD,
          role: 'admin',
        });
        console.log(`Admin user created successfully for ${email}.`);
      } else {
        console.log(`Admin user already exists for ${email}.`);
      }
    }
  } catch (error) {
    console.error('Error creating admin users:', error);
  }
});

// Handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
