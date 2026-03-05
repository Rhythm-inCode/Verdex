const sessionConfig = {
  name: "verdex.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,        // dev only
    sameSite: "lax",      // IMPORTANT
    maxAge: 1000 * 60 * 60 * 24
  }
};

export default sessionConfig;