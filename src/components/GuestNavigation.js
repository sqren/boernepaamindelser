import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { withRouter } from 'react-router';
import LockOpen from '@material-ui/icons/LockOpen';
import HelpIcon from '@material-ui/icons/Help';

const styles = () => ({
  navigation: {
    backgroundColor: '#eee'
  }
});

function GuestNavigation({ location, classes }) {
  return (
    <BottomNavigation
      value={location.pathname}
      className={classes.navigation}
      showLabels
    >
      <BottomNavigationAction
        href="#/login"
        label="Login"
        icon={<LockOpen />}
        value={'/login'}
      />
    </BottomNavigation>
  );
}

GuestNavigation.propTypes = {
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

export default withRouter(withStyles(styles)(GuestNavigation));
