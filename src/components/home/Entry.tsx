import {
  CircularProgress,
  IconButton,
  Slide,
  Snackbar,
} from "@material-ui/core";
import { TransitionProps } from "@material-ui/core/transitions";
import { ChevronRightRounded } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { useRouter } from "next/router";
import React, { FormEvent, forwardRef, useState } from "react";
import entryStyles from "../../../styles/components/home/Entry.module.css";
import {
  checkIfEmailExist,
  sendEmailVerificationLinkForLoggingIn,
} from "../../services/firebaseUtils";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children?: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export type Color = "success" | "info" | "warning" | "error";

const Entry = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [severity, setSeverity] = useState<Color>("error");

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email.length > 4) {
      setLoading(true);
      if (await checkIfEmailExist(email)) {
        await sendEmailVerificationLinkForLoggingIn(email);
        setLoading(false);
        setAlertMessage(
          `Verify your email by clicking link sent to you on ${email}`
        );
        setSeverity("success");
      } else {
        setAlertMessage(
          `The email: ${email} does not exist, kindly register yourself.`
        );
        setSeverity("error");
      }
      setLoading(false);
      setOpenAlert(true);
    }
  };

  return (
    <div className={entryStyles.container} id="entry">
      <div className={entryStyles.main}>
        <form onSubmit={login} className={entryStyles.loginInputField}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter e-mail to login"
          />
          {loading ? (
            <CircularProgress
              size={24}
              color="secondary"
              style={{ marginRight: 11 }}
            />
          ) : (
            <IconButton className={entryStyles.loginIcon} type="submit">
              <ChevronRightRounded />
            </IconButton>
          )}
        </form>

        <button
          onClick={() => router.push("/auth/register")}
          className={entryStyles.register}
        >
          Register
        </button>
      </div>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={openAlert}
        onClose={() => setOpenAlert(false)}
        key={new Date().getMilliseconds()}
        TransitionComponent={Transition}
        autoHideDuration={4444}
      >
        <Alert
          onClose={() => setOpenAlert(false)}
          severity={severity}
          style={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Entry;
