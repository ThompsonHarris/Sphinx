import { GoogleApiWrapper, Map, Marker } from 'google-maps-react';
import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import axios from 'axios';
import LandingPage from './Welcome/LandingPage';
import { connect } from 'react-redux';
import { fetchUnreadMessages, markAsRead } from '../redux/messages';
import { minDistance } from '../../utils';
import { googleMapStyles } from '.././utils/utils';

const MapContainer = props => {
  const [activeMarker, setActiveMarker] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState({});
  const [currentPosition, setCurrentPosition] = useState({});
  const [geoSupported, setGeoSupported] = useState(true);
  const [displayMessage, setDisplayMessage] = useState(false);
  const [dataUri, setDataUri] = useState('');
  // const [initialLoad, setInitialLoad] = useState(false);

  const { messages, activeUser } = props;

  if (!navigator.geolocation) {
    setGeoSupported(false);
  } else {
    navigator.geolocation.watchPosition(pos => {
      const coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      if (
        coords.lat !== currentPosition.lat ||
        coords.lng !== currentPosition.lng
      ) {
        setCurrentPosition(coords);
      }
    });
  }

  // COMMENTED OUT CODE FOR TESTING PURPOSES ONLY

  // const setTestUri = (Key) => {
  //   // console.log('Key: ', Key)
  //   axios.get(`/api/aws/${Key}`)
  //     .then(media => {
  //       // console.log('media.data: ', media.data)
  //       setDataUri(media.data)
  //       setDisplayMessage(true);
  //     })
  //     .catch(e => console.log('error in getMediaMessage thunk: ', e))
  // }

  // const testUriKey = '30c7916d-186b-4a05-9e9a-e660c7003357'

  // setTestUri(testUriKey)

  const onMarkerClick = (props, marker, e, msg, distance) => {
    if (distance > minDistance) return;
    setSelectedMessage(msg);
    setActiveMarker(marker);
    // check if it is a media message
    if (msg.fileType !== 'text' && msg.fileType !== 'link') {
      axios
        .get(`/api/aws/${msg.id}`)
        .then(media => {
          setDataUri(media.data);
          setDisplayMessage(true);
        })
        .catch(e => console.log('error in getMediaMessage thunk: ', e));
    }
    // display message in overlay
    setDisplayMessage(true);
  };

  const openMsgIcon = {
    url: 'https://image.flaticon.com/icons/svg/1483/1483336.svg',
    scaledSize: new props.google.maps.Size(50, 50),
  };

  const closedMsgIcon = {
    url: 'https://image.flaticon.com/icons/svg/1483/1483234.svg',
    scaledSize: new props.google.maps.Size(50, 50),
  };

  const computeDistance = (msg, curPos) => {
    const curLatLng = new props.google.maps.LatLng(
      parseFloat(curPos.lat),
      parseFloat(curPos.lng)
    );
    const msgLatLng = new props.google.maps.LatLng(
      parseFloat(msg.latitude),
      parseFloat(msg.longitude)
    );
    const distance = props.google.maps.geometry.spherical.computeDistanceBetween(
      curLatLng,
      msgLatLng
    );
    return distance;
  };

  const handleClose = () => {
    props.markAsRead(selectedMessage.id);
    setDisplayMessage(false);
  };

  return !activeUser.firstName ? (
    <LandingPage />
  ) : (
    <>
      {displayMessage ? (
        <>
          {dataUri ? (
            selectedMessage.fileType !== 'text' &&
            selectedMessage.fileType !== 'link' ? (
              // message type is 'image':
              <div>
                <img src={dataUri} />
                <button onClick={handleClose}>Close</button>
              </div>
            ) : (
              // message type is 'video':
              <div>
                <video src={props.data} autoPlay={true} />
                <button onClick={handleClose}>Close</button>
              </div>
            )
          ) : // message type is 'link':
          selectedMessage.fileType === 'link' ? (
            <div>
              <ReactPlayer url={selectedMessage.messageContent} playing />
              <button onClick={handleClose}>Close</button>
            </div>
          ) : (
            // message type is 'text':
            <div>
              <h2>{selectedMessage.messageTitle}</h2>
              <p>{selectedMessage.messageContent}</p>
              <button onClick={handleClose}>Close</button>
            </div>
          )}
        </>
      ) : geoSupported ? (
        <Map
          google={props.google}
          disableDefaultUI={true}
          zoom={14}
          style={{
            width: '100%',
            height: '100%',
            overfloe: 'hidden',
            position: 'static',
          }}
          styles={googleMapStyles}
          initialCenter={
            currentPosition.lat
              ? currentPosition
              : { lat: 40.766599, lng: -73.977607 }
          }
        >
          <Marker
            icon="https://www.robotwoods.com/dev/misc/bluecircle.png"
            scaledSize={new props.google.maps.Size(10, 10)}
            position={currentPosition}
          />
          {messages.length > 0 &&
            messages.map((msg, idx) => {
              const distance = computeDistance(msg, currentPosition);
              // console.log('distance: ', distance)
              return (
                <Marker
                  icon={distance < minDistance ? openMsgIcon : closedMsgIcon}
                  name={msg.messageTitle}
                  key={idx}
                  position={{ lat: msg.latitude, lng: msg.longitude }}
                  onClick={(props, marker, e) =>
                    onMarkerClick(props, marker, e, msg, distance)
                  }
                />
              );
            })}
        </Map>
      ) : (
        <div className="container">
          Location access must be enabled to view messages!
        </div>
      )}
    </>
  );
};

const Wrapper = GoogleApiWrapper({
  apiKey: 'AIzaSyBuvzQNuDiQUkXKwp5lUIc3fDLYkKS5Ru8',
})(MapContainer);

const mapState = ({ unreadMessages, activeUser }) => {
  return {
    messages: unreadMessages,
    activeUser,
  };
};

const mapDispatch = dispatch => {
  return {
    fetchMessages: () => dispatch(fetchUnreadMessages()),
    markAsRead: msgId => dispatch(markAsRead(msgId)),
    // getMediaMessage: key => dispatch(getMediaMessage(key)),
  };
};

export default connect(mapState, mapDispatch)(Wrapper);
