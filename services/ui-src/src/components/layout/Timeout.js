import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Dialog } from "@cmsgov/design-system";
import { useHistory } from "react-router-dom";
import {
  refreshCredentials,
  updateTimeout,
  useUser,
} from "../../hooks/authHooks";
import moment from "moment";

const calculateTimeLeft = (expiresAt) => {
  if (!expiresAt) return 0;
  return expiresAt.diff(moment()) / 1000;
};

const Timeout = ({ showTimeout, expiresAt }) => {
  const { logout } = useUser();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(expiresAt));
  const history = useHistory();
  useEffect(() => {
    const unlisten = history.listen(() => {
      updateTimeout();
    });

    if (!showTimeout) return;
    // eslint-disable-next-line no-unused-vars
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(expiresAt));
    }, 500);
    return () => {
      unlisten();
      clearInterval(timer);
    };
  });

  const logoutClick = () => {
    logout();
  };
  const refreshAuth = async () => {
    await refreshCredentials();
  };

  if (!showTimeout) return <></>;

  const expired = expiresAt.isBefore();
  const body = expired
    ? "You have been logged out due to inactivity. Please log in again."
    : `Due to inactivity, you will be logged out in ${Math.floor(
        timeLeft
      )} seconds.`;
  const logOutText = expired ? "Log In" : "Log Out";
  return (
    <>
      {showTimeout && (
        <Dialog
          isShowing={showTimeout}
          onExit={refreshAuth}
          data-testid="timeout-dialog"
          heading="You are about to be logged out."
          actions={[
            <button
              className="ds-c-button ds-u-margin-right--1"
              disabled={expired}
              key="Stay Logged In"
              aria-label="Stay Logged In"
              onClick={refreshAuth}
              data-testid="timeout-stay-logged-in"
            >
              Stay Logged In
            </button>,
            <button
              className="ds-c-button ds-c-button--primary ds-u-margin-right--1"
              key="Log Out"
              aria-label={logOutText}
              onClick={logoutClick}
              data-testid="timeout-log-out"
            >
              {logOutText}
            </button>,
          ]}
        >
          {body}
        </Dialog>
      )}
    </>
  );
};

Timeout.propTypes = {
  showTimeout: PropTypes.bool.isRequired,
  expiresAt: PropTypes.any.isRequired,
};

const mapState = (state) => ({
  showTimeout: state.stateUser.showTimeout,
  expiresAt: state.stateUser.expiresAt,
});

export default connect(mapState)(Timeout);
