import React, { useState } from 'react';
import { connect } from 'react-redux';
import VideoRecorder from 'react-video-recorder';
import MediaPreview from './MediaPreview';
import { addMessage } from '../../redux/messages';
import axios from 'axios';
import { PostSuccess } from './PostSuccess';
import { save } from 'save-file';
import './TakeVideo.css';

function TakeVideo(props) {
  const { channel } = props;

  console.log('props in takeVideo: ', props);

  const [blobUrl, setBlobUrl] = useState('');
  const [dataUrl, setDataUrl] = useState('');
  const [blob, setBlob] = useState('');
  const [success, setSuccess] = useState(false);

  function handleRecordingComplete(data) {
    // setDataUri(data)
    console.log('data (blob): ', data);
    setBlob(data);
    // console.log('blob: ', blob)
    const videoUrl = URL.createObjectURL(data);
    setBlobUrl(videoUrl);
    console.log('videoUrl: ', videoUrl);
  }

  function bufferToDataUrl(callback) {
    var reader = new FileReader();
    reader.onload = function() {
      callback(reader.result);
    };
    reader.readAsDataURL(blob);
  }

  const handlePost = () => {
    const postBody = {
      fileType: 'video',
      messageTitle: props.title,
      messageContent: 'video posted to AWS',
      latitude: props.latitude,
      longitude: props.longitude,
      radius: 1,
      channelId: channel,
    };
    bufferToDataUrl(url => {
      console.log('dataUrl: ', url);
      setDataUrl(url);
      props.addMessage(postBody, url);
    });

    setSuccess(true);
  };

  return blobUrl ? (
    <>
      {!success ? (
        <div>
          <MediaPreview data={blobUrl} type="video" />
          <div className="TakeVideo_buttons">
            <button className="TakeVideo_Post" onClick={handlePost}>
              POST
            </button>
            <button className="TakeVideo_Retake" onClick={() => setBlobUrl('')}>
              RETAKE
            </button>
          </div>
        </div>
      ) : (
        <div>
          <video src={dataUrl} autoPlay={true} className="image"></video>
          <PostSuccess />
        </div>
      )}
    </>
  ) : (
    <VideoRecorder
      // onTurnOnCamera={}
      // onTurnOffCamera={}
      // onStartRecording={}
      // onStopRecording={}
      onRecordingComplete={data => handleRecordingComplete(data)}
      // onOpenVideoInput={}
      // onStopReplaying={}
      // onError={}
      timeLimit={10000}
    />
  );
}

const mapState = ({ nav }) => {
  return {
    channel: nav.channel,
  };
};

const mapDispatch = dispatch => {
  return {
    addMessage: (msg, media) => dispatch(addMessage(msg, media)),
  };
};

export default connect(mapState, mapDispatch)(TakeVideo);
