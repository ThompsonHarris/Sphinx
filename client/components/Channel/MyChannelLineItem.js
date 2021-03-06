import React, { Component } from 'react';
import { connect } from 'react-redux';
import { subscribeToChannel, unsubscribeToChannel } from '../../redux/channels';
import history from '../../history';

import {
  List,
  ListItem,
  IconButton,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Button,
  Collapse,
  ListSubheader,
  Checkbox,
} from '@material-ui/core';
import ExitToApp from '@material-ui/icons/ExitToApp';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

class MyChannelLineItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      isVisible: false,
    };
  }

  clickToChangeOpenState = () => {
    this.setState({ open: !this.state.open });
  };

  clickToSwtichVisibility = () => {
    this.setState({ isVisible: !this.state.isVisible });
  };

  clickToUnsubscribeToChannel = (ev, channelId) => {
    ev.preventDefault();
    console.log('WHAT IS THE CHANNELID ON UNSUB', channelId);
    this.props.unsubscribeToChannel(channelId);
  };

  render() {
    return (
      <>
        <ListItem divider={this.props.divider}>
          {this.props.isFilterOn === true ? (
            <Checkbox
              color="primary"
              icon={<VisibilityOff />}
              checkedIcon={<Visibility />}
              onChange={() => {
                this.props.filterFunction();
                this.props.fetchFilteredMessage();
                this.clickToSwtichVisibility();
              }}
            />
          ) : null}
          <ListItemText primary={this.props.channelDetails.channelTitle} />
          {/* <Typography>{this.props.channelDetails.channelTitle}</Typography> */}
          <ListItemSecondaryAction>
            <ListItem
              button={true}
              onClick={() => this.clickToChangeOpenState()}
            >
              {this.state.open === true ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
          </ListItemSecondaryAction>
        </ListItem>
        <Collapse in={this.state.open} timeout="auto" unmountOnExit>
          <List component={'div'}>
            <ListSubheader>Channel Description</ListSubheader>
            <ListItem>
              <ListItemText
                primary={this.props.channelDetails.channelDescription}
              />
            </ListItem>
            <ListItem
              button={true}
              style={{ backgroundColor: 'tomato' }}
              onClick={ev => {
                this.clickToUnsubscribeToChannel(
                  ev,
                  this.props.channelDetails.id
                );
                // need this there to switch the open state back to false to prevent any channel line items below the one that you unsubscribed to be in an open state
                this.clickToChangeOpenState();
              }}
            >
              <ListItemText primary={'Leave Channel'} />
              <ExitToApp />
            </ListItem>
            {this.props.channelDetails.channelUser.isOwner ? (
              <ListItem
                button={true}
                style={{ backgroundColor: 'dodgerBlue' }}
                onClick={() =>
                  history.push(`/editchannel/${this.props.channelDetails.id}`)
                }
              >
                <ListItemText primary={'Edit Channel Details'} />
              </ListItem>
            ) : null}
          </List>
        </Collapse>
      </>
    );
  }
}

const mapStateToProps = state => ({
  channelData: state.channels,
});

const mapDispatchToProps = dispatch => {
  return {
    subscribeToChannel: channelId => dispatch(subscribeToChannel(channelId)),
    unsubscribeToChannel: channelId =>
      dispatch(unsubscribeToChannel(channelId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MyChannelLineItem);
