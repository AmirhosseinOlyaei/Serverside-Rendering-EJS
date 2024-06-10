// passport/passportInit.mjs
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/User.mjs";

const passportInit = () => {
  // Use the local strategy for authentication
  passport.use(
    "local",
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: "Incorrect credentials." });
          }

          const isMatch = await user.comparePassword(password);
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Incorrect credentials." });
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize user information into the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user information from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      if (!user) {
        return done(new Error("User not found"));
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

export default passportInit;
