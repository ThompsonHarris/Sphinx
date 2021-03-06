import React from 'react';
//css
import './app.css';
// react-redux
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
//Utils
import { urlBase64ToUint8Array } from './utils/utils';
//axios
import axios from 'axios';
//component
import BottomMenu from './components/BottomMenu/BottomMenu';
import Burger from './components/Burger/Burger';
//import Container from './components/container/Container';
import SlideMenu from './components/SlideMenu/SlideMenu';
import Feed from './components/Feed/feed';
import MapView from './components/MapView';
import LogIn from './components/login/logIn';
import ChannelSearch from './components/Channel/SearchForm';
import EditAccount from './components/EditAccount/EditAccount';
import MyAccount from './components/MyAccount/MyAccount';
import AddMessage from './components/message/AddMessage';
import CreateAChannel from './components/Channel/CreateChannel';
import SignUp from './components/SignUp/SignUp';
import { fetchChannels, fetchAllChannels } from './redux/channels';
import { fetchUnreadMessages } from './redux/messages';
import { initialLogInAttempt } from './redux/authentication/authentication';
import TakePhoto from './components/message/TakePhoto';
import TakeVideo from './components/message/TakeVideo';
import UploadFile from './components/message/Upload';
import EditAChannel from './components/Channel/EditChannel';
import LinkTest from './components/message/LinkTest';
import SelectMedia from './components/SelectMedia/Selectmedia';
import PhoneInput from './components/login/2FA/PhoneInput';
import SelectChannel from './components/SelectChannel/SelectChannel';

class App extends React.Component {
  componentDidMount() {
    this.props.initialLogInAttempt();
    if (this.props.activeUser.firstName) {
      // this.props.fetchChannels();
      // this.props.fetchAllChannels();
      // this.props.fetchUnreadMessages();
      // Request to get notifications

      Notification.requestPermission(result => {
        if (result !== 'granted') {
          //console.log('no notification granted!');
        } else {
          this.configurePushSub();
        }
      });
    }
  }

  displayConfirmNotification = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(swreg => {
        swreg.showNotification('Succesfully Subcribed!', options);
      });
    }
    let options = {
      body: 'you have succesfully subscribed to our notification service',
      icon: '../static/images/icon-120x120.png',
      //image: '.../',
      vibrate: [100, 50, 100],
      badge: '../static/images/icon-120x120.png',
    };
  };

  configurePushSub = () => {
    if (!('serviceWorker' in navigator)) {
      return;
    }
    let reg;
    navigator.serviceWorker.ready
      .then(swreg => {
        reg = swreg;
        return swreg.pushManager.getSubscription();
      })
      .then(sub => {
        if (sub === null) {
          // create new subscription
          let vapidPubKey =
            'BJZp_1rq7Cjl2Ij8-9GI4UnTG2jCB5MUvWyZRFh93VP9Wy2SKjNBDqiW-X1sQHud0Pc2BmNOsylUVSDznPTGk4g';
          let convertedPubVapidkey = urlBase64ToUint8Array(vapidPubKey);
          return reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedPubVapidkey,
          });
        } else {
          //going todo something else
        }
      })
      .then(newSub => {
        const endpoint = newSub.endpoint;
        const p256dh = newSub.toJSON().keys.p256dh;
        const auth = newSub.toJSON().keys.auth;
        return axios.post('/api/subscription', { endpoint, p256dh, auth });
      })
      .then(res => {
        this.displayConfirmNotification();
      })
      .catch(e => {
        console.log('subscription error', e);
      });
  };

  render() {
    return (
      <main>
        <div className="main">
          <Burger openSlide={this.props.openSlide} />
          <SlideMenu openSlide={this.props.openSlide} />
          <div className="container">
            <Route path="/" component={MapView} exact />
            <Route path="/feed" component={Feed} exact />
            <Route path="/channelSelect" component={SelectChannel} exact />
            <Route path="/post" component={SelectMedia} exact />
            <Route path="/message" component={AddMessage} exact />
            <Route path="/channelsearch" component={ChannelSearch} exact />
            <Route path="/login" component={LogIn} exact />
            <Route path="/user" component={MyAccount} exact />
            <Route path="/editaccount" component={EditAccount} exact />
            <Route path="/takephoto" component={TakePhoto} exact />
            <Route path="/takevideo" component={TakeVideo} exact />
            <Route path="/upload" component={UploadFile} exact />
            <Route path="/signup" component={SignUp} exact />
            <Route path="/linktest" component={LinkTest} exact />
            <Route path="/createnewchannel" component={CreateAChannel} exact />
            <Route path="/editchannel/:id" component={EditAChannel} />
            <Route path="/phoneinput" component={PhoneInput} />
          </div>
          <BottomMenu openSlide={this.props.openSlide} />
        </div>
      </main>
    );
  }
}

const mapStateToProps = state => ({
  openSlide: state.nav.displaySlideMenu,
  displayOverlay: state.nav.displayOverlay,
  activeUser: state.activeUser,
  authentication: state.authentication,
});

const mapDispatchToProps = dispatch => {
  return {
    initialLogInAttempt: () => dispatch(initialLogInAttempt()),
    fetchChannels: () => dispatch(fetchChannels()),
    fetchAllChannels: () => dispatch(fetchAllChannels()),
    fetchUnreadMessages: () => dispatch(fetchUnreadMessages()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
