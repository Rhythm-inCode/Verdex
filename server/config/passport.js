import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../src/models/User.model.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
        console.log("Google Profile:", profile);
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            user.googleId = profile.id;
            await user.save();
        } else {
            user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            });
        }
        }
        console.log("User going to done:", user);
        return done(null, user);
      } catch (err) {
        done(err, null);
        console.error("Google Auth Error:", err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log("Deserializing user ID:", id);
  const user = await User.findById(id);
  console.log("User found in deserialize:", user);
  done(null, user);
});

export default passport;